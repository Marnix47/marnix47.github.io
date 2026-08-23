.data
TARGET_WORD: .skip 8

TARGET_CHAR_TABLE: .skip 128
SUBMIT_CHAR_YELLOW_TABLE: .skip 128
//NO_YELLOW_TABLE: .skip 128 #byte is set to 1 if the char is already green, and must not be set to yellow

.text

handle_word_submitted:
    enter $16, $0

    movq $TABLE_CHARACTERS, %rax
    movq CURRENT_WORD_INDEX, %rdx
    movq 0(%rax, %rdx, 8), %rdi
    call word_exists
    testq %rax, %rax
    jz handle_word_submitted_nonexistent

    movq CURRENT_WORD_INDEX, %rdx
    movq $TABLE_CHARACTERS, %rax
    movq 0(%rax, %rdx, 8), %rdi
    movq WORD5BYTEMASK, %rcx
    andq %rcx, %rdi
    cmpq TARGET_WORD, %rdi
    je handle_word_submitted_target

    cmpq $5, CURRENT_WORD_INDEX
    je handle_word_submitted_lost

    handle_word_submitted_wrong:
    call update_colors
    jmp handle_word_submitted_return

    handle_word_submitted_lost:
    movq $7, %rdi
    call update_stats
    call update_colors
    movq $3, GAMESTATE
    jmp handle_word_submitted_return

    handle_word_submitted_target: 
    movq CURRENT_WORD_INDEX, %rdi
    incq %rdi
    call update_stats
    movq $0x0202020202020202, %rcx
    xorq %rax, %rax
    movq CURRENT_WORD_INDEX, %rdx
    movq %rcx, TABLE_COLORS(%rax, %rdx, 8) #make all characters on the current line green
    movq $2, GAMESTATE
    jmp handle_word_submitted_return

    handle_word_submitted_nonexistent:
    movq $0x0101010101010101, %rcx
    xorq %rax, %rax
    movq CURRENT_WORD_INDEX, %rdx
    movq %rcx, TABLE_COLORS(%rax, %rdx, 8) #make all characters on the current line red
    call show_game_screen
    movq $130000000, %rdi
    call sys_sleep #sleep 300ms
    movq $0x0808080808080808, %rcx
    xorq %rax, %rax
    movq CURRENT_WORD_INDEX, %rdx
    movq %rcx, TABLE_COLORS(%rax, %rdx, 8) #make all characters on the current line gray again
    call show_game_screen
    jmp handle_word_submitted_return_nochange

    handle_word_submitted_return:
    incq CURRENT_WORD_INDEX
    movq $0, CURRENT_WORD_CHARACTER_INDEX
    handle_word_submitted_return_nochange:
    leaveq
    ret

update_colors:
    #no params, no return
    #assumes word at current word index has been submitted
    enter $16, $0

    movq $TARGET_CHAR_TABLE, %rdi
    movq $32, %rsi #16*2 quadwords
    xorq %rdx, %rdx #fill with 0
    call sys_fill_memory

    #for submission: keep track of number of yellow occurences per character
    #for target: keep track of occurences per character, subtract in advance if green occurence in submission

    #generate target table:
    movq TARGET_WORD, %rdi
    movq $5, %rcx
    target_char_loop_construct_table:
        xorq %rax, %rax
        movb %dil, %al
        incb TARGET_CHAR_TABLE(%rax)
        shrq $8, %rdi
        decq %rcx
        jnz target_char_loop_construct_table
    
    movq CURRENT_WORD_INDEX, %rdx
    movq $TABLE_CHARACTERS, %rax
    movq 0(%rax, %rdx, 8), %rdi
    movq WORD5BYTEMASK, %rcx
    andq %rcx, %rdi

    movq $5, %rcx
    submit_char_loop_construct_table:
        xorq %rax, %rax
        movb %dil, %al
        incb SUBMIT_CHAR_YELLOW_TABLE(%rax)
        shrq $8, %rdi
        decq %rcx
        jnz submit_char_loop_construct_table

    movq CURRENT_WORD_INDEX, %rdx
    movq $TABLE_CHARACTERS, %rax
    movq 0(%rax, %rdx, 8), %rdi
    movq WORD5BYTEMASK, %rcx
    andq %rcx, %rdi
    movq $5, %rcx
    black_char_loop:
        movzbq %dil, %rax
        cmpb $0, TARGET_CHAR_TABLE(%rax)
        jne black_char_loop_bottom
        movb $0x00, KEYBOARD_CHARACTER_COLORS(%rax) #black
        black_char_loop_bottom:
        shrq $8, %rdi
        decq %rcx
        jnz black_char_loop
    
    movq $5, %rcx
    movq TARGET_WORD, %rsi
    movq CURRENT_WORD_INDEX, %rdx
    movq $TABLE_CHARACTERS, %rax
    movq 0(%rax, %rdx, 8), %rdi
    simult_green_char_loop:
        movzbq %dil, %rax
        cmpb %dil, %sil
        jne simult_green_loop_no_green
        #set buffers to green
        decq SUBMIT_CHAR_YELLOW_TABLE(%rax)
        decq TARGET_CHAR_TABLE(%rax)
        movq $5, %rdx
        subq %rcx, %rdx
        pushq %rcx
        pushq %rax

        movq CURRENT_WORD_INDEX, %rax
        movb $0x02, %cl
        movb %cl, TABLE_COLORS(%rdx, %rax, 8)

        popq %rax
        popq %rcx
        movq $0x02, %rdx
        movb %dl, KEYBOARD_CHARACTER_COLORS(%rax)

        simult_green_loop_no_green:
        shr $8, %rdi
        shr $8, %rsi
        decq %rcx
        jnz simult_green_char_loop

    movq $5, %rcx
    movq CURRENT_WORD_INDEX, %rdx
    movq $TABLE_CHARACTERS, %rax
    movq 0(%rax, %rdx, 8), %rdi #submission in rdi
    yellow_char_loop:
        ##if TARGET_CHAR_YELLOW_TABLE is non-zero in corresponding position:
        # decrement table, set to COLOR_TABLE to yellow
        ##if zero in NO_YELLOW_TABLE: also set keyboard to yellow
        movzbq %dil, %rax
        cmpb $0, TARGET_CHAR_TABLE(%rax)
        je yellow_char_loop_bottom
        
        movq CURRENT_WORD_INDEX, %r8
        movq $5, %r9
        subq %rcx, %r9
        movb TABLE_COLORS(%r9, %r8, 8), %dl
        cmpb $0x02, %dl
        je yellow_char_loop_bottom #if already green, skip this iteration

        decq TARGET_CHAR_TABLE(%rax)

        movq $0x03, %rdx
        movb %dl, TABLE_COLORS(%r9, %r8, 8) #r8 and r9 are still in place

        movb KEYBOARD_CHARACTER_COLORS(%rax), %dl
        cmpb $0x02, %dl
        je yellow_char_loop_bottom #SKIP IF IT WAS ALREADY GREEN

        movq $0x03, %rdx
        movb %dl, KEYBOARD_CHARACTER_COLORS(%rax)

        yellow_char_loop_bottom:
        shrq $8, %rdi
        decq %rcx
        jnz yellow_char_loop

    leaveq
    ret

reset_gamestate:
    enter $16, $0

    movq $0, TARGET_WORD
    movq $0, GAMESTATE
    
    #clear state_manager buffers:
    movq $TARGET_CHAR_TABLE, %rdi
    movq $32, %rsi #16*2 quadwords
    xorq %rdx, %rdx #fill with 0
    call sys_fill_memory

    #clear screen_manager buffers:
    movq $0, CURRENT_WORD_INDEX
    movq $0, CURRENT_WORD_CHARACTER_INDEX
    movq $TABLE_CHARACTERS, %rdi
    movq $6, %rsi
    movq $0x2020202020202020, %rdx
    call sys_fill_memory
    movq $TABLE_COLORS, %rdi
    movq $6, %rsi
    movq $0x0808080808080808, %rdx
    call sys_fill_memory

    #clear keyboard buffers:
    movq $KEYBOARD_CHARACTER_COLORS, %rdi
    movq $16, %rsi
    movq $0x0808080808080808, %rdx
    call sys_fill_memory

    leaveq
    ret

