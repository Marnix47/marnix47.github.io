.data
virtual_number_object_struct: .skip 40
virtual_number_render_info_struct:
    .quad 6
    .quad 7
    .skip 336
number_bcd_buff: .skip 40

highscore_render_info_struct:
    .skip 40

new_render_object_struct:
    .skip 40

.text

convert_unsigned_num_to_ascii:
    #par 1: unsigned 64-bit integer
    #par 2: 0x2d for dash at the start, any other value for nothing at the start
    #return value: pointer to string buffer
    pushq %rbp
    movq %rsp, %rbp

    pushq %r12
    pushq %r13
    pushq %r14
    pushq %r15

    movq $1000000000000000000, %r12 #highest possible power of 10 in r12
    movq $number_bcd_buff, %r14 #r14 points to next free character in output buffer
    movq $0, %r15 #0 if (leading) 0 is invalid, 1 if not
    movq $0, %r13 #r13 holds the amount of digits appended (not including dash prefix)

    unsigned_bit_loop:
        cmpq $0, %r12
        movq $0, %rdx
        jle end_unsigned_bit_loop
        movq %rdi, %rax
        div %r12 #divide what's left of the input number by an increasingly lower power of 10
        movq %rdx, %rdi #rest (input number for next iteration) is in rdx
        cmpb $0, %al #check if current digit is 0
        jne unsigned_append_char #if not 0, we can always append the digit
        cmpq $0, %r15 #check if this 0 is a leading 0
        je unsigned_skip_leading_zero
        unsigned_append_char:
        cmpq $10, %rax
        jl append_single_digit
        subq $10, %rax
        movb $0x31, (%r14)
        incq %r14
        append_single_digit:
        incq %r13 #increment the amount of appended digits
        movq $1, %r15
        movb %al, (%r14) #quotient into next available character in buff
        addb $0x30, (%r14) #convert character to ascii
        incq %r14 #make r14 point to the next free spot in buff

        unsigned_skip_leading_zero:
        movq %r12, %rax
        cqo
        movq $10, %rcx
        div %rcx
        movq %rax, %r12 #decrement the power of 10 in r12, to be able to check a less significant digit

        jmp unsigned_bit_loop # back to top of loop

    end_unsigned_bit_loop:
    cmpq $0, %r13 #check if no digits have been appended
    jne unsigned_append_terminator
    movb $0x30, (%r14) #if no digits have been appended, add a '0'
    incq %r14
    unsigned_append_terminator:
    movq $0x00, (%r14) #append a terminator
    movq $number_bcd_buff, %rax #return pointer to output buffer

    popq %r15
    popq %r14
    popq %r13
    popq %r12

    movq %rbp, %rsp
    popq %rbp
    ret

render_number_wrapper:
    #par 1: x pos of top left (mP)
    #par 2: y pos of top left (mP)
    #par 3: which number (0-9)
    #no return value
    pushq %rbp
    movq %rsp, %rbp
    #load all values of struct into virtual struct:
    movq $virtual_number_object_struct, %rcx
    addq OBJECT_POS_X, %rcx
    movq %rdi, (%rcx)

    movq $virtual_number_object_struct, %rcx
    addq OBJECT_POS_Y, %rcx
    movq %rsi, (%rcx)

    movq $virtual_number_object_struct, %rcx
    addq OBJECT_SPEED_X, %rcx
    movq $0, (%rcx)

    movq $virtual_number_object_struct, %rcx
    addq OBJECT_SPEED_Y, %rcx
    movq $0, (%rcx)

    movq $virtual_number_object_struct, %rcx
    addq OBJECT_RENDER_INFO, %rcx
    movq $virtual_number_render_info_struct, (%rcx)

    #copy render info into virtual render_info struct
    movq %rdx, %rax
    movq $336, %r8
    mulq %r8
    addq $numbers_render_info, %rax
    movq %rax, %rsi #address of destination
    movq $virtual_number_render_info_struct, %r9
    addq OBJECT_PIXELS, %r9
    movq %r9, %rdi #address of source
    movq $336, %rdx #size = 336 bytes
    call memmove
    movq $virtual_number_object_struct, %rdi
    call render_object

    movq %rbp, %rsp
    popq %rbp
    ret

render_unsigned_int:
    #par 1: x_pos (mP)
    #par 2: y_pos (mP) of top left
    #par 3: number (max. 10^8 - 1)
    pushq %rbp
    movq %rsp, %rbp

    pushq %r12
    pushq %r13
    pushq %r14
    pushq %r15

    pushq %rdi #at rbp-40
    pushq %rsi #at rbp-48
    
    movq %rdx, %rdi
    call convert_unsigned_num_to_ascii
    movq $number_bcd_buff, %r12
    movq $0, %r13 #offset from x_pos
    movq $0, %r15 ## 1000 if number was 1, because 1 is 1 pixel smaller

    render_int_loop:
        cmpb $0, (%r12) #r12 points to current number in buff
        je end_render_int_loop
        movq $0, %r15
        cmpb $0x31, (%r12) #if r12 points to 1, the width is 1 less than normal
        jne render_int_not_1
        movq $1000, %r15
        render_int_not_1:
        movq -40(%rbp), %r14
        addq %r13, %r14
        movq %r14, %rdi #x pos into rdi
        movq -48(%rbp), %rsi #y pos into rsi
        movzbq (%r12), %rdx
        subq $0x30, %rdx #value of number into rdx
        render_digit:
        call render_number_wrapper

        addq $4000, %r13
        subq %r15, %r13 #if this number was 1, offset is 1 pixel less
        incq %r12 #make r12 point to next number
        jmp render_int_loop

    end_render_int_loop:
    popq %rsi
    popq %rdi

    popq %r15
    popq %r14
    popq %r13
    popq %r12

    movq %rbp, %rsp
    popq %rbp
    ret

render_highscore_text:
    pushq %rbp
    movq %rsp, %rbp

    #make sure the render_info_struct is pointed to by the highscore struct:
    movq $highscore_render_info_struct, %rcx
    addq OBJECT_RENDER_INFO, %rcx
    movq $render_info_highscore, (%rcx)
    
    movq $highscore_render_info_struct, %rcx
    addq OBJECT_POS_X, %rcx
    movq $21000, (%rcx) #x_pos = 21000 mP

    movq $highscore_render_info_struct, %rcx
    addq OBJECT_POS_Y, %rcx
    movq $35000, (%rcx) #y_pos = 35000 mP

    movq $highscore_render_info_struct, %rdi
    call render_object

    movq %rbp, %rsp
    popq %rbp
    ret

render_new_text:
    pushq %rbp
    movq %rsp, %rbp
    #set all attributes of the new_render_object_struct and call render_object on it
    movq $new_render_object_struct, %rcx
    addq OBJECT_RENDER_INFO, %rcx
    movq $render_info_new, (%rcx)
    
    movq $new_render_object_struct, %rcx
    addq OBJECT_POS_X, %rcx
    movq $31000, (%rcx)

    movq $new_render_object_struct, %rcx
    addq OBJECT_POS_Y, %rcx
    movq $27000, (%rcx)

    movq $new_render_object_struct, %rdi
    call render_object

    movq %rbp, %rsp
    popq %rbp
    ret

render_highscore_interface:
    pushq %rbp
    movq %rsp, %rbp

    cmpq $1, new_highscore
    jne do_render_highscore
    movq cycle_count, %rax
    movq $20, %r8
    cqo
    divq %r8
    cmpq $10, %rdx
    jl do_render_highscore
    call render_new_text #blink new_text
    do_render_highscore:
    call render_highscore_text
    movq highscore, %rdi
    call convert_unsigned_num_to_ascii
    movq $number_bcd_buff, %rdi
    call strlen
    x_calc:
    movq $2, %r8
    cqo
    div %r8 #divide length by 2
    addq $3, %rax
    movq $1000, %r8
    mulq %r8 #multiply rax to be in mP
    movq $40000, %rdi
    subq %rax, %rdi #calculated x_pos of numbers
    
    movq $43000, %rsi #height of numbers
    movq highscore, %rdx #value of numbers
    call render_unsigned_int

    movq %rbp, %rsp
    popq %rbp
    ret
