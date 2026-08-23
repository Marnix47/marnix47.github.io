.data
TERMIOS_BUFF: .skip 64
RESET_TERMIOS_BUFF: .skip 64

c_lflag: .quad 12
c_cc: .quad 17
VMIN: .quad 6
VTIME: .quad 5

.text

set_termios:
    #enables canonical mode
    #disables echo
    #sets VMIN and VTIME to 0
    #when the user presses a key, it won't be visible on the screen
    #when calling read, 0 is returned if no chars are available, or the available chars are loaded
    pushq %rbp
    movq %rsp, %rbp
    #get the current termios settings
    movq $TERMIOS_BUFF, %rdi
    call sys_tcgetattr
    movq $RESET_TERMIOS_BUFF, %rdi
    call sys_tcgetattr

    end_get:
    #adjust the termios settings
    movq $TERMIOS_BUFF, %r8
    addq c_cc, %r8
    addq VMIN, %r8
    movb $1, (%r8)

    movq $TERMIOS_BUFF, %r8
    addq c_cc, %r8
    addq VTIME, %r8
    movb $0, (%r8)

    movq $TERMIOS_BUFF, %r8
    addq c_lflag, %r8
    andl $~2, (%r8)
    andl $~8, (%r8)

    # write back
    movq $TERMIOS_BUFF, %rdi
    call sys_tcsetattr

    end_set:
    leaveq
    ret

reset_termios:
    movq $RESET_TERMIOS_BUFF, %rdi
    call sys_tcsetattr
    ret

