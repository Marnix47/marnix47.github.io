.data
TCSETS: .quad 21505
TCGETS: .quad 21506
ENTER_ALTERNATE_SCREEN_STRING: .asciz "\x1b[?1049h"
EXIT_ALTERNATE_SCREEN_STRING: .asciz "\x1b[?1049l"
STORE_CURSOR_STRING: .asciz "\x1b[s";
RESTORE_CURSOR_STRING: .asciz "\x1b[u";
CURSOR_TOP_LEFT_STRING: .asciz "\x1b[1;1H"
SHOW_CURSOR: .asciz "\x1b[?25h"
HIDE_CURSOR: .asciz "\x1b[?25l"
ERROR_READ_ZERO_BYTES: .asciz "ERROR: SYS_READ_STDIN received 0 bytes, exiting.\n"
GENERIC_ERROR: .asciz "ERROR, exiting.\n"
OPEN_FLAGS: .quad 0x02
OPEN_MODE: .quad 0644

.text

sys_enter_new_terminal:
    movq $ENTER_ALTERNATE_SCREEN_STRING, %rdi
    call sys_print
    movq $STORE_CURSOR_STRING, %rdi
    call sys_print
    movq $CURSOR_TOP_LEFT_STRING, %rdi
    call sys_print
    movq $HIDE_CURSOR, %rdi
    call sys_print
    ret

sys_exit_new_terminal:
    movq $EXIT_ALTERNATE_SCREEN_STRING, %rdi
    call sys_print
    movq $RESTORE_CURSOR_STRING, %rdi
    call sys_print
    movq $SHOW_CURSOR, %rdi
    call sys_print
    ret

strlen:
    movq %rdi, %r8
    movq $-1, %rcx
    movb $0, %al
    cld
    repne scasb
    subq %r8, %rdi
    leaq -1(%rdi), %rax
    ret

sys_print:
    #pointer to 0 terminated string in rdi
    movq %rdi, %rbx
    call strlen
    movq %rax, %rdx
    movq %rbx, %rsi
    movq $1, %rdi
    movq $1, %rax
    syscall
    ret

sys_tcgetattr:
    #pointer to buffer in rdi
    movq %rdi, %rdx
    movq TCSETS, %rsi
    movq $0, %rdi
    movq $16, %rax
    syscall
    ret

sys_tcsetattr:
    #pointer to buffer in rdi
    movq %rdi, %rdx
    movq TCGETS, %rsi
    movq $0, %rdi
    movq $16, %rax
    syscall
    ret

sys_sleep:
    #rdi: time in nanoseconds
    pushq %rbp
    movq %rsp, %rbp
    subq $16, %rsp

    xorq %rdx, %rdx
    movq %rdi, %rax
    movq $1000000000, %rcx
    divq %rcx #seconds into rax, nanoseconds into rdx
    movq %rax, (%rsp)
    movq %rdx, 8(%rsp)

    movq %rsp, %rdi
    movq $35, %rax
    syscall

    leaveq
    ret

sys_read_stdin:
    #no params, returns 1 input byte in %al
    pushq %rbp
    movq %rsp, %rbp
    subq $16, %rsp

    movq $0, %rdi
    movq %rsp, %rsi
    movq $1, %rdx
    movq $0, %rax
    syscall

    test %rax, %rax
    jnz read_stdin_not_zero
    movq $ERROR_READ_ZERO_BYTES, %rdi
    call sys_exit
    syscall #exit
    read_stdin_not_zero:
    xorq %rax, %rax
    movb (%rsp), %al
    leaveq
    ret

sys_exit:
    #rdi: pointer to error message, set to 0 for no message
    pushq %rbp
    movq %rsp, %rbp
    subq $16, %rsp
    movq %rdi, (%rsp)
    call reset_termios
    call sys_exit_new_terminal
    movq (%rsp), %rdi
    testq %rdi, %rdi
    jz sys_exit_no_err
    call sys_print
    sys_exit_no_err:
    movq $60, %rax
    syscall

sys_fill_memory:
    #rdi: pointer to start of memory
    #rsi: number of quadwords to clear
    #rdx: quadword to fill memory with
    movq %rsi, %rcx
    movq %rdx, %rax
    rep stosq
    ret

itoa:
    #0 <= rdi < 10^8
    #returns ascii in rax (NOT POINTER), with highest-order char in %al
    #%al represents the first byte if rax were moved to memory
    ##if rdi >= 10^7, rax is not 0-terminated!!!
    movq $8, %rcx
    movq %rdi, %rax
    itoa_loop:
        xorq %rdx, %rdx
        movq $10, %rsi
        divq %rsi
        movb %dl, %dil
        orb $0x30, %dil #convert to ascii
        testq %rax, %rax
        je itoa_loop_break #break if 0 is left

        shlq $8, %rdi
        decq %rcx
        jnz itoa_loop

    itoa_loop_break:
    movq %rdi, %rax
    ret

sys_open:
    #rdi: pointer to file path string
    #returns fd or -1 (error) in rax
    ##if file does not exist, it is created
    enter $0, $0

    movq %rdi, %rsi
    movq $-100, %rdi #open relative to current directory, AT_FDCWD
    movq OPEN_FLAGS, %rdx
    movq OPEN_MODE, %r10
    movq $257, %rax
    syscall

    leaveq 
    ret

sys_close:
    #fd in rdi
    movq $3, %rax
    syscall
    ret

sys_read:
    #rdi: fd
    #rsi: buffer pointer
    #rdx: buffer size
    xorq %rax, %rax
    syscall
    ret

sys_write:
    #rdi: fd
    #rsi: buffer pointer
    #rdx: buffer size (bytes)
    movq $1, %rax
    syscall
    ret
