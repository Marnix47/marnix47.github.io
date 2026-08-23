.data
TESTSTRING: .asciz "Hello World!\n"
GAMESTATE: .quad 0 #0 = start, 1 = playing, 2 = WON, 3 = gameover
HELLOSTRING: .asciz "ZELQQ"
GEESESTRING: .asciz "GEESE"
.skip 2
WORD5BYTEMASK: .quad 0x000000ffffffffff #remove trailing spaces
.skip 2
SUCCESFULLY_FOUND_WORD: .asciz "FOUND WORD!"
NOT_FOUND_WORD: .asciz "COULD NOT FIND WORD"
.skip 2

.text
.global main
.include "syscalls.s"
.include "print_buff.s"
.include "termios.s"
.include "words.s"
.include "words2.s"
.include "word_manager.s"
.include "screen_manager.s"
.include "keyboard.s"
.include "input_manager.s"
.include "state_manager.s"
.include "stats_manager.s"
#ASSEMBLE WITH:
#as -no-pie -g -o wordle.o main.s && ld --fatal-warnings --entry main -o wordle wordle.o

main:
    enter $0, $0
    
    call sys_enter_new_terminal

    call set_termios

    call game

    call reset_termios

    call sys_exit_new_terminal

    leaveq
    ret

game:
    pushq %rbp
    movq %rsp, %rbp

    start:
    call show_stats_screen
    call sys_read_stdin
    cmpb $0x1b, %al
    jne start_moveto_playing
    movq $0, %rdi
    call sys_exit
    start_moveto_playing:
    movq $1, GAMESTATE
    call get_random_word
    CALLED_RANDOM:
    movq %rax, TARGET_WORD
    jmp playing

    playing:
    cmpq $2, GAMESTATE
    je won
    cmpq $3, GAMESTATE
    je gameover
    call show_game_screen

    call sys_read_stdin
    PLAYING:
    movb %al, %dil
    call process_input_char
    jmp playing

    won:
    cmpq $1, GAMESTATE
    je playing
    call show_won_screen
    call sys_read_stdin
    movb %al, %dil
    call process_input_char
    jmp won

    gameover:
    cmpq $1, GAMESTATE
    je playing
    call show_gameover_screen
    call sys_read_stdin
    movb %al, %dil
    call process_input_char
    jmp gameover

    leaveq
    ret

.section .note.GNU-stack,"",@progbits
