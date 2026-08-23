.data


.text

process_input_char:
    #dil: input character
    enter $16, $0

    movq %rdi, (%rsp)

    movb %dil, %al
    subb $0x1b, %al
    jz process_escape

    cmpq $2, GAMESTATE
    jge handle_input_paused_state

    movb %dil, %al
    subb $0x7f, %al
    jz process_backspace

    movb %dil, %al
    subb $0x0a, %al
    jz process_enter

    movq CURRENT_WORD_CHARACTER_INDEX, %rcx
    subq $5, %rcx
    jz discard_input_char #discard if buffer is full

    movb %dil, %al
    subb $0x41, %al
    js discard_input_char

    movb %dil, %al
    subb $0x5b, %al
    js process_upper_char

    movb %dil, %al
    subb $0x61, %al
    js discard_input_char

    movb %dil, %al
    subb $0x7b, %al
    js process_lower_char
    jmp discard_input_char

    handle_input_paused_state:
    call reset_gamestate
    movq $1, GAMESTATE
    call get_random_word
    movq %rax, TARGET_WORD
    RESET:
    jmp return_process_input_char

    process_lower_char:
    subb $0x20, %dil
    jmp process_upper_char

    process_upper_char:
    movq CURRENT_WORD_INDEX, %rcx
    movq CURRENT_WORD_CHARACTER_INDEX, %rdx
    movb %dil, TABLE_CHARACTERS(%rdx, %rcx, 8)
    incq CURRENT_WORD_CHARACTER_INDEX
    jmp return_process_input_char

    process_backspace:
    movq CURRENT_WORD_CHARACTER_INDEX, %rcx
    testq %rcx, %rcx
    jz discard_input_char #if buffer of current word is empty, discard backspace
    #TODO
    decq CURRENT_WORD_CHARACTER_INDEX
    movq CURRENT_WORD_INDEX, %rcx
    movq CURRENT_WORD_CHARACTER_INDEX, %rdx
    movb $0x20, TABLE_CHARACTERS(%rdx, %rcx, 8)
    jmp return_process_input_char

    process_enter:
    cmpq $5, CURRENT_WORD_CHARACTER_INDEX
    jne return_process_input_char
    call handle_word_submitted

    jmp return_process_input_char

    process_escape:
    movq $0, %rdi
    call sys_exit

    discard_input_char:
    return_process_input_char:
    leaveq
    ret

