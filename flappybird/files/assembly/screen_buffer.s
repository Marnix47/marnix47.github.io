.data
set_cursor: .asciz "\x1B[%hhu;%hhuH"
set_bg: .asciz "\x1b[48;5;%hhum"
set_fg: .asciz "\x1b[38;5;%hhum"
terminal_reset: .asciz "\033[2J\033[H"

space: .asciz " "
// unicode_format: .asciz "\u"
lower_block_char: .string "▄"

OBJECT_WIDTH: .quad 0
OBJECT_HEIGHT: .quad 8
OBJECT_PIXELS: .quad 16

OBJECT_SPEED_X: .quad 0
OBJECT_SPEED_Y: .quad 8
OBJECT_POS_X: .quad 16
OBJECT_POS_Y: .quad 24
OBJECT_RENDER_INFO: .quad 32

screen_buffer: #every bytes represents a pixel. Bytes 0-79 are the first row.
    .skip 6400 #80x40 bytes
    #(0,0) is top left pixel

.text

fill_screen_buffer:
    #par1: color
    #fills the entire buffer with color specified in par1
    pushq %rbp
    movq %rsp, %rbp

    pushq %r12
    pushq %r13
    pushq %r14
    pushq %r15

    movq %rdi, %r13 #BG color in r13
    movq $0, %r12 #loop index in r12

    loop_fill_screen_buffer:
        cmpq $6400, %r12
        je end_loop_fill_screen_buffer #if all pixels have been looped over
        movq %r12, %r14
        addq $screen_buffer, %r14 #r14 points to the current byte in the buffer
        movb %r13b, (%r14) #move the 8-bit color into the byte
        incq %r12 #increment loop index
        jmp loop_fill_screen_buffer

    end_loop_fill_screen_buffer:

    popq %r15
    popq %r14
    popq %r13
    popq %r12

    movq %rbp, %rsp
    popq %rbp
    ret

set_pixel_screen_buffer:
    #par1: 0-indexed x (column), in P, not mP
    #par2: 0-indexed y (row), in P, not mP
    #par3: color (8-bit ansi)
    #returns 0 on succes, 1 on out of bounds
    #BE AWARE that 231 is interpreted as transparent (keep the current color), for white use 15

    pushq %rbp
    movq %rsp, %rbp

    cmpq $231, %rdx #check for transparency
    je return_set_pixel_screen_buffer
    #check out of bounds:
    movq $1, %rax
    cmpq $0, %rdi
    js return_set_pixel_screen_buffer
    cmpq $79, %rdi
    jg return_set_pixel_screen_buffer
    cmpq $0, %rsi
    js return_set_pixel_screen_buffer
    cmpq $79, %rsi
    jg return_set_pixel_screen_buffer

    movq %rdx, %rcx #move color in rcx
    movq $80, %rax
    mulq %rsi
    addq $screen_buffer, %rax
    addq %rdi, %rax #rax now points to the pixel we want to set

    movb %cl, (%rax) #move the 8-bit color into the place pointed to by rax

    movq $0, %rax #return succes
    return_set_pixel_screen_buffer:
    movq %rbp, %rsp
    popq %rbp
    ret

advanced_flush_screen_buffer:
    #no parameters, no return
    pushq %rbp
    movq %rsp, %rbp
    pushq %r12 #r12 at rbp-8
    pushq %r13 #r13 at rbp-16
    pushq %r14 #r14 at rbp-24
    pushq %r15 #r15 at rbp-32
    pushq %rbx #rbx at rbp-40
    pushq $0 #dummy at rbp-48

    movq $screen_buffer, %r12
    pushq $1 #column number (1-indexed) at rbp-56
    pushq $1 #row number (1-indexed) at rbp-64
    movq $1, %r15 #row 

    loop_advanced_flush_screen_buffer:
        cmpq $80, -56(%rbp)
        jng no_reset_loop_advanced_flush_screen_buffer
        movq $1, -56(%rbp)
        incq -64(%rbp)
        cmpq $40, -64(%rbp)
        jge end_loop_advanced_flush_screen_buffer

        no_reset_loop_advanced_flush_screen_buffer:
        #calculate address of upper pixel:
        movq $screen_buffer, %r12
        addq -56(%rbp), %r12
        decq %r12
        movq $80, %rax
        mulq -64(%rbp)
        movq $2, %rcx
        mulq %rcx
        subq $160, %rax
        addq %rax, %r12 #rax now points to the current pixel
        movb (%r12), %r15b #move color into r15

        movq $set_cursor, %rdi
        movq -64(%rbp), %rsi
        movq -56(%rbp), %rdx
        call printf

        movq $set_bg, %rdi
        movzbq %r15b, %rsi
        call printf

        addq $80, %r12 #set r12 to point to pixel on next line
        movq $set_fg, %rdi
        movb (%r12), %r15b #move color into r15
        movzbq %r15b, %rsi
        call printf

        movq $lower_block_char, %rdi
        call printf

        incq -56(%rbp)
        jmp loop_advanced_flush_screen_buffer

    end_loop_advanced_flush_screen_buffer:
    movq $0, %rdi
    call fflush

    popq %rbx
    popq %rbx
    popq %r15
    popq %r14
    popq %r13
    popq %r12
    movq %rbp, %rsp
    popq %rbp
    ret


render_object:
    #par1: pointer to object struct
    #BE AWARE that 231 is interpreted as transparent. For white, use 15
    pushq %rbp
    movq %rsp, %rbp

    pushq %r12 #at rbp-8
    pushq %r13 #at rbp-16
    pushq %r14 #at rbp-24
    pushq %r15 #at rbp-32

    pushq %rdi #pointer to object struct at rbp-40

    movq %rdi, %rax
    addq OBJECT_POS_X, %rax #rdi points to x pos of object
    movq (%rax), %rax
    cqo #sign-extend rax into rdx, such that rdx:rax is correct
    movq $1000, %rsi
    idiv %rsi
    pushq %rax # object x_pos at rbp-48

    movq %rdi, %rax
    addq OBJECT_POS_Y, %rax #rdi points to y pos of object
    movq (%rax), %rax
    cqo
    movq $1000, %rsi
    idiv %rsi
    pushq %rax # object y_pos at rbp-56

    movq %rdi, %rax
    addq OBJECT_RENDER_INFO, %rax #rdi points to render info pointer of object
    pushq (%rax) # object render_info at rbp-64

    #caluclate column of right-most pixels
    movq -64(%rbp), %rcx
    addq OBJECT_WIDTH, %rcx #rcx points to object width
    movq (%rcx), %r8
    movq -48(%rbp), %rdi # object x pos
    addq %rdi, %r8 #r8 now contains column number of right-most pixels
    pushq %r8 #push column number of right-most pixels at rbp-72

    #calculate line of lowest pixels
    calc_low:
    movq -64(%rbp), %rcx #pointer to render info struct into rcx
    addq OBJECT_HEIGHT, %rcx
    movq (%rcx), %r9
    movq -56(%rbp), %rdi #rdi now contains object y-pos
    addq %rdi, %r9 #r9 now contains row number of lowest pixels
    pushq %r9 #push row number of lowest pixels at rbp-80

    #use r12 for row number (starts at y-pos)
    #use r13 for column number (starts at x-pos)
    #use r14 as pointer to pixel's place in struct
    movq -56(%rbp), %r12
    movq -64(%rbp), %r14
    addq OBJECT_PIXELS, %r14

    render_object_line_loop:
        cmpq -80(%rbp), %r12 #check if r12 points to lowest row
        jge end_render_object_line_loop
        movq -48(%rbp), %r13 #move object x_pos into column holder r13
        render_object_column_loop:
            #check for out of bounds:
            cmpq -72(%rbp), %r13
            jge end_render_object_column_loop
            cmpq $0, %r13
            jl end_iteration_render_object_column_loop
            cmpq $80, %r13
            jge end_iteration_render_object_column_loop
            #set the pixel if not out of bounds
            movq (%r14), %rdx #r14 points to pixel in render_info_struct
            movq %r13, %rdi
            movq %r12, %rsi
            call set_pixel_screen_buffer

            end_iteration_render_object_column_loop:
            incq %r13 #increment column number
            addq $8, %r14 #make r14 point to the next pixel in render_info_struct
            jmp render_object_column_loop

        end_render_object_column_loop:
        incq %r12 #increment row number
        jmp render_object_line_loop
    end_render_object_line_loop:

    addq $48, %rsp #discard the stack up to values of callee-saved registers
    popq %r15
    popq %r14
    popq %r13
    popq %r12

    movq %rbp, %rsp
    popq %rbp
    ret
