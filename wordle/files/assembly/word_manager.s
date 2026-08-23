.data
NUMBER_OF_WORDS: .quad 2315 #number of words in wordlist 2 (common words)
WORD_JUMPTABLE:
    .quad WORDLIST_A    # A
    .quad WORDLIST_B    # B
    .quad WORDLIST_C    # C
    .quad WORDLIST_D    # D
    .quad WORDLIST_E    # E
    .quad WORDLIST_F    # F
    .quad WORDLIST_G    # G
    .quad WORDLIST_H    # H
    .quad WORDLIST_I    # I
    .quad WORDLIST_J    # J
    .quad WORDLIST_K    # K
    .quad WORDLIST_L    # L
    .quad WORDLIST_M    # M
    .quad WORDLIST_N    # N
    .quad WORDLIST_O    # O
    .quad WORDLIST_P    # P
    .quad WORDLIST_Q    # Q
    .quad WORDLIST_R    # R
    .quad WORDLIST_S    # S
    .quad WORDLIST_T    # T
    .quad WORDLIST_U    # U
    .quad WORDLIST_V    # V
    .quad WORDLIST_W    # W
    .quad WORDLIST_X    # X
    .quad WORDLIST_Y    # Y
    .quad WORDLIST_Z    # Z
    .quad WORDS_END

.text

get_random_word:
    #returns uppercase word in rax (NO POINTER)
    pushq %rbp
    movq %rsp, %rbp

    movq NUMBER_OF_WORDS, %rdi
    call random_quadword

    xorq %rdx, %rdx
    movq WORDLIST2(%rdx, %rax, 8), %rax
    movq $0x0000002020202020, %rdx
    subq %rdx, %rax

    leaveq
    ret

random_quadword:
    #return value in range of 0 (inclusive) and rdi (exclusive)
    pushq %rbp
    movq %rsp, %rbp

    pushq %rdi
    pushq $0
    call read_tsc
    popq %r8
    movq %rax, %r8
    popq %rdi
    xorq %rdx, %rdx
    divq %rdi
    movq %rdx, %rax

    leaveq
    ret

read_tsc:
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rax
    movq $0, %rdx
    rdtsc
    shlq $32, %rdx
    addq %rdx, %rax

    leaveq
    ret

word_exists:
    #rdi: word UPPERCASE (NOT pointer to word!)
    #returns 1 (true) or 0 (false)
    enter $16, $0
    movq $0x0000002020202020, %rcx
    addq %rcx, %rdi #convert to lower case
    movq WORD5BYTEMASK, %rcx
    andq %rcx, %rdi #remove trailing spaces
    movq %rdi, (%rsp)
    // movq %rdi, %rdx
    movzbq %dil, %rdx #move first character of word into rdx
    subq $0x61, %rdx
    xorq %r8, %r8
    movq WORD_JUMPTABLE(%r8, %rdx, 8), %rdi
    incq %rdx
    movq WORD_JUMPTABLE(%r8, %rdx, 8), %rcx
    subq %rdi, %rcx
    shr $3, %rcx #divide rcx by 8, because we are dealing with quadwords
    //rax <- convert rdi to lower case
    //rdi <- calculate table address
    //rcx <- difference between consecutive table pointers
    //set rcx to the right count (to search only what's necessary)
    //set rax to the string we're looking for
    movq (%rsp), %rax
    repne scasq
    testq %rcx, %rcx
    jz return_false_word_exists
    return_true_word_exists:
    movq $1, %rax
    jmp return_word_exists
    return_false_word_exists:
    movq $0, %rax
    return_word_exists:
    leaveq
    ret


