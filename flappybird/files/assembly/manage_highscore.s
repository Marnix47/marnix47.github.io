.data
cache_highscore:
    .quad 0

ph: .asciz "%qu"
file_path: .asciz "highscore.txt"
read_write_mode: .asciz "w+"
read_mode: .asciz "r"

.text
setup_highscore:
    #no pars, no return value
    #subroutine loads highscore into cache
    pushq %rbp
    movq %rsp, %rbp

    movq $file_path, %rdi
    movq $read_mode, %rsi
    call fopen

    movq %rax, %rdi
    pushq %rax
    pushq $0
    movq $ph, %rsi
    movq $highscore, %rdx
    call fscanf
    read_hs:

    popq %rax
    popq %rdi
    call fclose

    movq %rbp, %rsp
    popq %rbp
    ret

write_highscore:
    #no pars, no return value
    #subroutine writes current_score into file
    pushq %rbp
    movq %rsp, %rbp

    movq $file_path, %rdi
    movq $read_write_mode, %rsi
    call fopen

    movq %rax, %rdi
    pushq %rax
    pushq $0
    movq $ph, %rsi
    // movq cache_highscore, %rdx
    movq current_score, %rdx
    call fprintf

    popq %rax
    popq %rdi
    call fclose

    return_write_highscore:
    movq %rbp, %rsp
    popq %rbp
    ret

handle_recent_score:
    #no pars
    #no return value
    #checks if current_score is higher than highscore
    ##if so, it writes the highscore to the file, updates highscore label and sets new_highscore to 1
    #otherwise, sets new_highscore to 0
    pushq %rbp
    movq %rsp, %rbp
    
    movq $0, new_highscore
    movq current_score, %r8
    cmpq %r8, highscore
    jge handle_recent_score_no_highscore #if no new highscore
    
    movq $1, new_highscore
    movq %r8, highscore
    call write_highscore

    handle_recent_score_no_highscore:
    movq %rbp, %rsp
    popq %rbp
    ret

reset_highscore:
    #no pars, no return value
    #sets highscore to 0 in label and file, and sets new_highscore to 0
    pushq %rbp
    movq %rsp, %rbp
    
    movq $0, highscore
    call write_highscore

    movq $0, new_highscore

    movq %rbp, %rsp
    popq %rbp
    ret
