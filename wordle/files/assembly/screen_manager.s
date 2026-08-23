.data
CLEAR_SCREEN_STRING: .asciz "\x1b[2J"
WELCOME_MESSAGE: .asciz "Welcome to Wordle. Press any key to start.\nPress ESC to leave at any point."
WON_MESSAGE: .asciz "\x1b[6mYou guessed it!\x1b[25m\n Press ESC to leave, or any key to play again."
GAMEOVER_MESSAGE1: .asciz "Too bad! The word was "
GAMEOVER_MESSAGE2: .asciz ".\n Press ESC to leave, or any key to play again."

CURRENT_WORD_INDEX: .quad 0
CURRENT_WORD_CHARACTER_INDEX: .quad 0

TABLE_CHARACTERS: .fill 48, 1, 0x20 #empty is 0x20 (space) (first 5 bytes for characters, rest is redundant), 6 rows
TABLE_COLORS: .fill 48, 1, 0x08 # background color of character, defaults to gray (0x08)

GRID_OFFSET_Y: .quad 2
GRID_OFFSET_X: .quad 5

SM_SET_BG_COLOR: .asciz "\x1b[48;5;00m" #can be modified by owning subroutine
SM_MOVE_CURSOR: .asciz "\x1b[00;00H" #can be modified by owning subroutine

HORIZONTAL_BORDER: .asciz "═"
VERTICAL_BORDER: .asciz "║"
CORNER_BORDER: .asciz "╔"
.asciz "╗"
.asciz "╝"
.asciz "╚"



.text
show_welcome_screen:
    movq $CLEAR_SCREEN_STRING, %rdi
    call sys_print
    movq $CURSOR_TOP_LEFT_STRING, %rdi
    call sys_print
    movq $WELCOME_MESSAGE, %rdi
    call sys_print
    ret

show_game_screen:
    pushq %rbp
    movq %rsp, %rbp

    movq $CLEAR_SCREEN_STRING, %rdi
    call sys_print
    call show_grid
    call draw_grid_border
    call draw_keyboard

    leaveq
    ret

show_won_screen:
    enter $0, $0

    movq $CLEAR_SCREEN_STRING, %rdi
    call sys_print
    call show_grid
    call draw_grid_border
    movq KEYBOARD_OFFSET_Y, %rdi
    movq KEYBOARD_OFFSET_X, %rsi
    call screen_manager_move_cursor
    movq $WON_MESSAGE, %rdi
    call print_buff
    call flush_buff

    leaveq
    ret

show_gameover_screen:
    enter $0, $0

    movq $CLEAR_SCREEN_STRING, %rdi
    call sys_print
    call show_grid
    call draw_grid_border
    movq KEYBOARD_OFFSET_Y, %rdi
    movq KEYBOARD_OFFSET_X, %rsi
    call screen_manager_move_cursor
    movq $GAMEOVER_MESSAGE1, %rdi
    call print_buff
    movq $TARGET_WORD, %rdi
    call print_buff
    movq $GAMEOVER_MESSAGE2, %rdi
    call print_buff
    call flush_buff

    leaveq
    ret

show_grid:
    pushq %rbp
    movq %rsp, %rbp

    movq $5, %rcx #Y loop counter
    show_grid_y_loop:
        movq $4, %rdx #X loop counter
        show_grid_x_loop:
            pushq %rcx
            pushq %rdx
            movq %rcx, %rdi
            addq GRID_OFFSET_Y, %rdi
            // leaq GRID_OFFSET_Y(%rcx), %rdi
            movq %rdx, %rsi
            addq GRID_OFFSET_X, %rsi
            // leaq GRID_OFFSET_X(%rdx), %rsi
            call screen_manager_move_cursor

            movq (%rsp), %rdx
            movq 8(%rsp), %rcx
            xorq %rdi, %rdi
            movb TABLE_COLORS(%rdx, %rcx, 8), %dil
            call screen_manager_set_bg_color

            movq (%rsp), %rdx
            movq 8(%rsp), %rcx
            xorq %rdi, %rdi
            movb TABLE_CHARACTERS(%rdx, %rcx, 8), %dil
            call screen_manager_output_char

            popq %rdx
            popq %rcx
            decq %rdx
            jns show_grid_x_loop #jump if counter is not negative
        decq %rcx
        jns show_grid_y_loop
    
    call flush_buff

    leaveq
    ret

draw_grid_border:
    pushq %rbp
    movq %rsp, %rbp
    subq $16, %rsp
    movq $5, (%rsp)
    movq $0, %rdi
    call screen_manager_set_bg_color
    border_loop_left:
    movq (%rsp), %rdi
    addq GRID_OFFSET_Y, %rdi
    movq GRID_OFFSET_X, %rsi
    decq %rsi
    call screen_manager_move_cursor
    movq $VERTICAL_BORDER, %rdi
    call print_buff
    decq (%rsp)
    jns border_loop_left

    movq $5, (%rsp)
    border_loop_right:
    movq (%rsp), %rdi
    addq GRID_OFFSET_Y, %rdi
    movq GRID_OFFSET_X, %rsi
    addq $5, %rsi
    call screen_manager_move_cursor
    movq $VERTICAL_BORDER, %rdi
    call print_buff
    decq (%rsp)
    jns border_loop_right

    movq $4, (%rsp)
    border_loop_bottom:
    movq (%rsp), %rsi
    movq GRID_OFFSET_Y, %rdi
    addq $6, %rdi
    addq GRID_OFFSET_X, %rsi
    call screen_manager_move_cursor
    movq $HORIZONTAL_BORDER, %rdi
    call print_buff
    decq (%rsp)
    jns border_loop_bottom

    movq $4, (%rsp)
    border_loop_top:
    movq (%rsp), %rsi
    movq GRID_OFFSET_Y, %rdi
    decq %rdi
    addq GRID_OFFSET_X, %rsi
    call screen_manager_move_cursor
    movq $HORIZONTAL_BORDER, %rdi
    call print_buff
    decq (%rsp)
    jns border_loop_top

    movq GRID_OFFSET_Y, %rdi
    decq %rdi
    movq GRID_OFFSET_X, %rsi
    decq %rsi
    call screen_manager_move_cursor
    movq $CORNER_BORDER, %rdi
    call print_buff

    movq GRID_OFFSET_Y, %rdi
    decq %rdi
    movq GRID_OFFSET_X, %rsi
    addq $5, %rsi
    call screen_manager_move_cursor
    movq $CORNER_BORDER, %rdi
    addq $4, %rdi
    call print_buff

    movq GRID_OFFSET_Y, %rdi
    addq $6, %rdi
    movq GRID_OFFSET_X, %rsi
    addq $5, %rsi
    call screen_manager_move_cursor
    movq $CORNER_BORDER, %rdi
    addq $8, %rdi
    call print_buff

    movq GRID_OFFSET_Y, %rdi
    addq $6, %rdi
    movq GRID_OFFSET_X, %rsi
    decq %rsi
    call screen_manager_move_cursor
    movq $CORNER_BORDER, %rdi
    addq $12, %rdi
    call print_buff

    call flush_buff
    leaveq
    ret

screen_manager_move_cursor:
    #rdi: y position (1-based)
    #rsi: x-position (1-based)
    pushq %rbp
    movq %rsp, %rbp
    pushq %rdi
    pushq %rsi

    call itoa100
    movq $SM_MOVE_CURSOR, %rcx
    movw %ax, 2(%rcx)
    movq (%rsp), %rdi
    call itoa100
    movq $SM_MOVE_CURSOR, %rcx
    movw %ax, 5(%rcx)
    movq $SM_MOVE_CURSOR, %rdi
    call print_buff
    leaveq
    ret

screen_manager_set_bg_color:
    #rdi: ansi 8-bit color code, must be < 100
    pushq %rbp
    movq %rsp, %rbp

    call itoa100
    CALLED_ITOA:
    movq $SM_SET_BG_COLOR, %rcx
    movw %ax, 7(%rcx)
    movq $SM_SET_BG_COLOR, %rdi
    call print_buff
    leaveq
    ret

screen_manager_output_char:
    #dl: character
    pushq %rbp
    movq %rsp, %rbp

    testb %dil, %dil
    jz return_screen_manager_output_char

    subq $16, %rsp
    movq $0, (%rsp)
    movb %dil, (%rsp)

    movq %rsp, %rdi
    call print_buff

    return_screen_manager_output_char:
    leaveq
    ret

itoa100:
    #0 <= dil < 100
    #returns ascii-encoded integer in %ax
    xorq %rax, %rax
    xorq %rcx, %rcx
    movb $10, %cl
    movb %dil, %al
    divb %cl
    orw $0x3030, %ax
    ret
