.data

termios_buff: .skip 64
original_termios_buff: .skip 64
reset_string: .asciz "tput reset"

.text

set_termios_instant_read:
    #enables canonical mode
    #disables echo
    #sets VMIN and VTIME to 0
    #when the user presses a key, it won't be visible on the screen
    #when calling read, 0 is returned if no chars are available, or the available chars are loaded
    pushq %rbp
    movq %rsp, %rbp
    #get the current termios settings
    movq $0, %rdi #0 = stream STDOUT
    movq $termios_buff, %rsi
    call tcgetattr
    movq $original_termios_buff, %rsi
    call tcgetattr

    end_get:
    #adjust the termios settings
    movq $termios_buff, %r8
    addq c_cc, %r8
    addq VMIN, %r8
    movq $0, (%r8)

    movq $termios_buff, %r8
    addq c_cc, %r8
    addq VTIME, %r8
    movq $0, (%r8)

    movq $termios_buff, %r8
    addq c_lflag, %r8
    andw $~2, (%r8)
    andw $~8, (%r8)

    # write back
    movq $0, %rdi #TCSANOW, apply changes immediately
    movq $0, %rsi #TCSADRAIN = 0
    movq $termios_buff, %rdx
    call tcsetattr

    end_set:
    movq %rbp, %rsp
    popq %rbp
    ret


reset_termios:
    #ONLY CALL WHEN set_termios_instant_read was already called!
    #no pars, no return value
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rdi
    movq $0, %rsi
    movq $original_termios_buff, %rdx
    movq $original_termios_buff, %r8
    addq c_lflag, %r8
    orw $2, (%r8)
    orw $8, (%r8)
    call tcsetattr

    movq $reset_string, %rdi
    call system #echo the bash reset command
    called_system:

    movq %rbp, %rsp
    popq %rbp
    ret

