.data
KEYBOARD_CHARACTER_COLORS: .fill 128, 1, 0x08 #.skip 128
#KEYBOARD COLORS: 0x08 (gray) default, black (0x00) for not in word, yellow (0x03) and green (0x02)
#REMEMBER THAT WE CAN ONLY USE COLOR CODES LESS THAN 100
KEYBOARD_OFFSET_Y: .quad 10
KEYBOARD_OFFSET_X: .quad 2
KEYBOARD_CHARACTER_LOCATIONS:
    .byte 1, 2 #A
    .byte 6, 3 #B
    .byte 4, 3 #C
    .byte 3, 2 #D
    .byte 3, 1 #E
    .byte 4, 2 #F
    .byte 5, 2 #G
    .byte 6, 2 #H
    .byte 8, 1 #I
    .byte 7, 2 #J
    .byte 8, 2 #K
    .byte 9, 2 #L
    .byte 8, 3 #M
    .byte 7, 3 #N
    .byte 9, 1 #O
    .byte 10, 1 #P
    .byte 1, 1 #Q
    .byte 4, 1 #R
    .byte 2, 2 #S
    .byte 5, 1 #T
    .byte 7, 1 #U
    .byte 5, 3 #V
    .byte 2, 1 #W
    .byte 3, 3 #X
    .byte 6, 1 #Y
    .byte 2, 3 #Z

.text

draw_keyboard:
    enter $16, $0

    movq $25, (%rsp)
    keyboard_char_loop:
        movq (%rsp), %rcx
        xorq %rax, %rax
        movzbq KEYBOARD_CHARACTER_LOCATIONS(%rax, %rcx, 2), %rsi
        addq KEYBOARD_OFFSET_X, %rsi
        incq %rax
        movzbq KEYBOARD_CHARACTER_LOCATIONS(%rax, %rcx, 2), %rdi
        addq KEYBOARD_OFFSET_Y, %rdi
        call screen_manager_move_cursor
        
        movq (%rsp), %rcx
        movq $0x41, %rax
        movzbq KEYBOARD_CHARACTER_COLORS(%rax, %rcx, 1), %rdi
        call screen_manager_set_bg_color
        
        movq (%rsp), %rcx
        leaq 0x41(%rcx), %rdi
        call screen_manager_output_char
        
        decq (%rsp)
        jns keyboard_char_loop
    
    movq $0, %rdi
    call screen_manager_set_bg_color
    call flush_buff

    leaveq
    ret

