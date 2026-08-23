
.data
STATS_BUFFER: .skip 64 #8 bytes per number, 8 numbers'
#total games, 1, ..., 6, gameover
STATS_PATH: .asciz "stats.txt"
STATS_FD: .skip 8 #fd for stats.txt
STATS_MESSAGE: .asciz "Press ESC to leave, or any key to play\n\n"
STATS_GUESSES_LINE1: .asciz "0:\t"
STATS_GUESSES_LINE2: .asciz "\t"
STATS_GUESSES_LINE3: .asciz "\n\n"
STATS_GUESSES_LINE4: .asciz "failed:\t"
STATS_TOTAL_LINE: .asciz "\n══════════════\ntotal:\t"
STATS_BLOCK_BAR_BUFF: .skip 256
BLOCK_CHAR: .asciz "█"
STATS_BLOCK_COUNT_BUFF: .skip 64

#REQUIRES syscalls.s and screen_manager.s
.text
update_stats:
    #rdi: result. gameover=7, 1 <= rdi <= 7
    enter $16, $0
    movq %rdi, (%rsp)
    call stats_fill_buffer

    movq $STATS_PATH, %rdi
    call sys_open
    movq %rax, STATS_FD

    #it does not matter when rax=0 (file was created),
    #bc the buffer already is in the right state (all zero)
    incq STATS_BUFFER #increment total games
    xorq %rax, %rax
    movq (%rsp), %rdi
    incq STATS_BUFFER(%rax, %rdi, 8)

    movq STATS_FD, %rdi
    movq $STATS_BUFFER, %rsi
    movq $64, %rdx
    call sys_write

    movq STATS_FD, %rdi
    call sys_close

    leaveq
    ret

show_stats_screen:
    enter $16, $0

    call stats_fill_buffer

    movq $CLEAR_SCREEN_STRING, %rdi
    call sys_print

    movq $0, %rdi
    movq $0, %rsi
    call screen_manager_move_cursor

    movq $STATS_MESSAGE, %rdi
    call print_buff

    call stats_calc_bars
    movq $1, (%rsp)
    movq $6, 8(%rsp)
    stats_lines_loop:
        movq (%rsp), %rdi
        xorq %rax, %rax
        movq STATS_BLOCK_COUNT_BUFF(%rax, %rdi, 8), %rsi
        call stats_print_success_line
        incq (%rsp)
        decq 8(%rsp)
        jnz stats_lines_loop

    call stats_print_fail_line
    call stats_print_total_line
    call flush_buff

    leaveq
    ret

get_stat_ascii:
    #rdi: stat buffer index
    #assumes stats are in buffer
    enter $16, $0

    xorq %rax, %rax
    movq STATS_BUFFER(%rax, %rdi, 8), %rdi
    call itoa

    leaveq
    ret

stats_print_success_line:
    #rdi: number of guesses (1 <= rdi <= 6)
    #rsi: number of block characters for bar
    enter $32, $0
    movq %rdi, 8(%rsp)
    movq %rsi, 16(%rsp)

    addb $0x30, %dil
    movb %dil, STATS_GUESSES_LINE1
    movq $STATS_GUESSES_LINE1, %rdi
    call print_buff

    movq 8(%rsp), %rdi
    call get_stat_ascii
    movq %rax, (%rsp)
    movq %rsp, %rdi
    call print_buff

    movq $STATS_GUESSES_LINE2, %rdi
    call print_buff

    movq 16(%rsp), %rdi
    call stats_get_block_bar
    movq %rax, %rdi
    call print_buff

    movq $STATS_GUESSES_LINE3, %rdi
    call print_buff

    leaveq
    ret

stats_print_fail_line:
    enter $32, $0
    movq $7, %rdi
    movq %rdi, 8(%rsp)

    movq $STATS_GUESSES_LINE4, %rdi
    call print_buff

    movq 8(%rsp), %rdi
    call get_stat_ascii
    movq %rax, (%rsp)
    movq %rsp, %rdi
    call print_buff

    movq $STATS_GUESSES_LINE2, %rdi
    call print_buff

    movq STATS_BLOCK_COUNT_BUFF+56, %rdi
    call stats_get_block_bar
    movq %rax, %rdi
    call print_buff

    leaveq
    ret

stats_print_total_line:
    enter $16, $0

    movq $STATS_TOTAL_LINE,  %rdi
    call print_buff
    
    movq STATS_BUFFER, %rdi
    call itoa
    movq %rax, (%rsp)
    movq %rsp, %rdi
    call print_buff

    leaveq
    ret

stats_get_block_bar:
    #rdi: number of blocks
    enter $16, $0
    movq %rdi, (%rsp)
    movq $STATS_BLOCK_BAR_BUFF, %rdi
    movq $32, %rsi
    movq $0, %rdx
    call sys_fill_memory #clear old string
    movq $0, %rcx
    movq (%rsp), %rdi
    testq %rdi, %rdi
    jz break_block_bar_loop
    block_bar_loop:
        movl BLOCK_CHAR, %eax
        movl %eax, STATS_BLOCK_BAR_BUFF(%rcx)
        addq $3, %rcx
        decq %rdi
        jnz block_bar_loop
    break_block_bar_loop:
    movq $STATS_BLOCK_BAR_BUFF, %rax
    leaveq
    ret

stats_fill_buffer:
    enter $0, $0

    movq $STATS_PATH, %rdi
    call sys_open
    movq %rax, STATS_FD
    movq %rax, %rdi
    movq $STATS_BUFFER, %rsi
    movq $64, %rdx
    call sys_read

    movq STATS_FD, %rdi
    call sys_close

    leaveq
    ret

stats_calc_bars:
    #fills STATS_BLOCK_COUNT_BUFF with number of blocks for quads 1-7
    enter $16, $0

    movq $7, %rcx
    movq $50, %r8
    movq STATS_BUFFER, %r9
    xorq %rdx, %rdx
    fill_bar_buff_loop:
        movq STATS_BUFFER(%rdx, %rcx, 8), %rax
        mulq %r8
        xorq %rdx, %rdx
        divq %r9
        xorq %rdx, %rdx
        movq %rax, STATS_BLOCK_COUNT_BUFF(%rdx, %rcx, 8)
        decq %rcx
        jnz fill_bar_buff_loop

    leaveq
    ret
    #Intel 255H has no AVX512 support:
    // vmovdqa64 STATS_BUFFER, %zmm1
    // vmovdqa64 %zmm1, STATS_BLOCK_COUNT_BUFF #fill bar buffer with same vals
    // vpbroadcastq STATS_BUFFER, %zmm2 #load total into zmm2
    // vcvtuqq2pd %zmm2, %zmm2 #convert to 64-bit fp
    // vcvtuqq2pd %zmm1, %zmm1 #convert to 64-bit fp
    // vrcp14pd %zmm2, %zmm2 #calculate reciprocate (1/x)
    // movq $50, %rax
    // vpbroadcastq %rax, %zmm3
    // vcvtuqq2pd %zmm3, %zmm3 #convert to 64-bit fp
    // vpxorq %zmm5, %zmm5, %zmm5 #clear zmm5
    // #TODO:
    // // vpmullq %zmm1, %zmm3, %zmm4 #multiply zmm1 by zmm3 and store in zmm4
    // vfmadd213pd %zmm3, %zmm5, %zmm1 #multiply zmm1 by 50
    // vfmadd213pd %zmm2, %zmm5, %zmm1 #multiply by 1/total
    // vcvtpd2qq %zmm1, %zmm1
    // vmovdqa64 %zmm1, STATS_BLOCK_COUNT_BUFF
    // ret

