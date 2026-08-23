.data
PRINT_BUFFER: .skip 8192
PRINT_BUFFER_INDEX: .quad 0

.text

print_buff:
    #rdi: string pointer
    #caller is responsible for flushing in time
    pushq %rbp
    movq %rsp, %rbp
    subq $16, %rsp
    movq %rdi, (%rsp)

    call strlen
    movq %rax, %rcx
    movq %rax, -8(%rsp)
    movq (%rsp), %rsi
    movq $PRINT_BUFFER, %rdi
    addq PRINT_BUFFER_INDEX, %rdi
    rep movsb

    movq PRINT_BUFFER_INDEX, %rdx
    addq -8(%rsp), %rdx
    movq %rdx, PRINT_BUFFER_INDEX

    leaveq
    ret

flush_buff:
    movq $PRINT_BUFFER, %rdi
    call sys_print
    #clear the buffer:
    movq $1024, %rcx
    xorq %rax, %rax
    movq $PRINT_BUFFER, %rdi
    rep stosq
    movq $0, PRINT_BUFFER_INDEX

    ret
