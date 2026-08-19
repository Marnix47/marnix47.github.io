

.data

BG_COLOR: .quad 14

bird_objects:
    .skip 8

object_bird:
    .quad 0
    .quad 0
    .quad 10000
    .quad 10
    .quad 0

timespec:
    .quad 0
    .quad 25000000 #25 ms

cycle_count:
    .quad 0

cumulative_distance_since_last_pipe_added:
    .quad 0

collision: .quad 0

acceleration:
    .quad -140

game_state:
    .quad 0 #0 for start_await_play, 1 for play, 2 for gameover

current_score:
    .quad 10

highscore: .quad 0

new_highscore: .quad 0 #0 if last score was not highscore, 1 if it was

c_lflag: .quad 12
c_cc: .quad 17
VMIN: .quad 6
VTIME: .quad 5
// .EQU ECHO, 8 #13th bit from the left in little-endian memory
// .EQU ICANON, 2 #15th bit from the left in little-endian memory

read_buff: .skip 64

.include "screen_buffer.s"
.include "render_info_bird.s"
.include "render_info_pipe.s"
.include "numbers_render_info.s"
.include "render_info_highscore.s"
.include "render_info_new.s"
.include "set_termios.s"
.include "pipe_manager.s"
.include "number_manager.s"
.include "manage_highscore.s"

.text
.global main


main:
    pushq %rbp
    movq %rsp, %rbp

    call set_termios_instant_read

    call new_bird
    call new_pipe

    call setup_highscore

    refresh_screen:
        #increment cycle count and wait 25 ms
        incq cycle_count
        movq $timespec, %rdi
        movq $0, %rsi
        call nanosleep

    check_game_state:
        #hceck game state, jump to corresponding code
        cmpq $0, game_state
        je start_await_play
        cmpq $1, game_state
        je play_game
        cmpq $2, game_state
        je gameover

    start_await_play:
        #TODO: only show blinking bird, at frequency of 2 Hz
        movq BG_COLOR, %rdi
        call fill_screen_buffer
        call render_highscore_interface

        // calc_blink:
        movq cycle_count, %rax
        cqo
        movq $20, %r8
        divq %r8
        cmpq $5, %rdx #see if the remainder of dividing cycle count by 20 is less than 5
        jl start_blink_no_show
        start_blink_show:
        movq bird_objects, %rdi
        call render_object
        start_blink_no_show:
        call advanced_flush_screen_buffer

        #read keyboard input
        call custom_read
        movq %rax, read_buff
        cmpq $0x71, read_buff #check for q
        je end_program
        cmpq $0x72, read_buff #check for r
        jne start_check_space
        call reset_highscore

        start_check_space:
        cmpq $0x20, read_buff #check for space
        jne refresh_screen
        start_space:
        #reset values
        movq $0, current_score
        movq $1, game_state
        movq $0, collision
        jmp refresh_screen

    play_game:
        #check if bird is in pipe or on the ground
        call handle_illegal_bird_position
        cmpq $1, %rax
        jne play_game_no_collision
        call handle_recent_score
        movq $2, game_state #gameover
        jmp refresh_screen

        play_game_no_collision:
        #fill screen with BG_color
        movq BG_COLOR, %rdi
        call fill_screen_buffer
        
        play_game_no_space:
        #handle score increment:
        call handle_cumulative_dist
        #check for oldest pipe if it should be removed
        call pipes_handle_removal
        #apply gravity to bird
        movq bird_objects, %rdi
        call apply_gravity_object
        #move bird
        movq bird_objects, %rdi
        call move_object
        #move pipes
        movq $move_object, %rdi
        movq $1, %rsi
        call pipe_manager_for_all_pipes
        #render pipes
        movq $render_object, %rdi
        call pipe_manager_for_all_pipes
        #rende rbird
        movq bird_objects, %rdi
        call render_object
        #render score at position (1,1)
        movq $1000, %rdi
        movq $1000, %rsi
        movq current_score, %rdx
        call render_unsigned_int
        #flush 80x80 buffer
        call advanced_flush_screen_buffer

        #check for space
        call custom_read
        movq %rax, read_buff
        cmpq $0x20, read_buff
        jne refresh_screen
        movq bird_objects, %rdi
        call bird_jump
        jmp refresh_screen

    gameover:
        #TODO: make bird blink, keep everything in the original position
        movq BG_COLOR, %rdi
        call fill_screen_buffer
        movq $render_object, %rdi
        call pipe_manager_for_all_pipes

        calc_blink:
        movq cycle_count, %rax
        cqo
        movq $20, %r8
        divq %r8
        cmpq $10, %rdx
        jl gameover_blink_no_show
        gameover_blink_show:
        movq bird_objects, %rdi
        call render_object
        gameover_blink_no_show:
        #render highscore interface
        call render_highscore_interface
        #render current score at (1,1)
        movq $1000, %rdi
        movq $1000, %rsi
        movq current_score, %rdx
        call render_unsigned_int
        call advanced_flush_screen_buffer

        #check keyboard input
        call custom_read
        movq %rax, read_buff
        cmpq $0x20, read_buff #check for space
        jne gameover_no_space
        #reset all objects
        call reset_bird
        call pipe_manager_clear_all
        call pipe_manager_reset_speed
        call new_pipe
        movq $0, new_highscore
        movq $0, game_state

        gameover_space:
        jmp refresh_screen

        gameover_no_space:
        cmpq $0x71, read_buff #check for q
        je end_program
        cmpq $0x72, read_buff #check for r
        jne gameover_no_reset
        call reset_highscore
        gameover_no_reset:
        jmp refresh_screen

    end_program:
    call reset_termios
    movq %rbp, %rsp
    popq %rbp
    movq $0, %rdi
    call exit


custom_read:
    #no pars
    #return value: character in rax, also stored in read_buff
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rdi #STDIN_FILENO
    movq $read_buff, %rsi
    movq $1, %rdx #read 1 byte
    call read
    cmpq $0, %rax #check if a character was available
    je custom_read_no_char
    movq read_buff, %rax
    custom_read_no_char:

    movq %rbp, %rsp
    popq %rbp
    ret
    

new_bird:
    #allocates 40 bytes of memory for new bird struct, moves the struct into the memory,
    #sets bird_objects to point to the new struct,
    #makes object_bird.RENDER_INFO_BIRD point to render_info_bird

    pushq %rbp
    movq %rsp, %rbp
    pushq %rbx
    pushq %rbx

    movq $40, %rdi
    call malloc
    called_malloc:
    #save the new address in bord_objects
    movq %rax, bird_objects
    movq %rax, %r8
    movq $0, %rbx
    loop_new_bird:
        #copy all values from the bird struct into the new struct
        cmpq $32, %rbx
        je end_loop_new_bird
        movq $bird_objects, %rdi
        movq %r8, %rdi
        addq %rbx, %rdi #rdi now points to new struct.index

        movq $object_bird, %rsi
        addq %rbx, %rsi #rsi now points to object_bird.index
        // movq (%rsi), (%rdi)
        movq (%rsi), %r9
        movq %r9, (%rdi)
        addq $8, %rbx
        jmp loop_new_bird

    end_loop_new_bird:
    #set the render_info_pointer
    movq %r8, %rdi
    addq %rbx, %rdi
    movq $render_info_bird, (%rdi)

    popq %rbx
    popq %rbx

    movq %rbp, %rsp
    popq %rbp
    ret

reset_bird:
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rbx
    loop_reset_bird:
        #copy all values from the bird struct into the struct pointed to by bird_objects
        cmpq $32, %rbx
        jge end_loop_reset_bird
        movq bird_objects, %rdi
        addq %rbx, %rdi

        movq $object_bird, %rsi
        addq %rbx, %rsi
        movq (%rsi), %r9
        movq %r9, (%rdi)
        addq $8, %rbx
        jmp loop_reset_bird

    end_loop_reset_bird:
    #set render_info pointer
    movq bird_objects, %rdi
    addq %rbx, %rdi
    movq $render_info_bird, (%rdi)

    movq %rbp, %rsp
    popq %rbp
    ret

apply_gravity_object:
    #par 1: pointer to object struct
    #no return
    #changes the speed of the object
    pushq %rbp
    movq %rsp, %rbp

    #calculate dv (= a * dt = a):
    movq acceleration, %r9 #r9 contains dv

    movq %rdi, %r8
    addq OBJECT_SPEED_Y, %r8 #r8 now points to y speed
    subq %r9, (%r8) #decrement the speed of the object by dv

    movq %rbp, %rsp
    popq %rbp
    ret

bird_jump:
    #par 1: pointer to object struct
    #no return
    #changes the speed of the object
    pushq %rbp
    movq %rsp, %rbp

    movq %rdi, %r8
    addq OBJECT_SPEED_Y, %r8 #r8 now points to y speed
    movq $-1500, (%r8) #set object speed

    movq %rbp, %rsp
    popq %rbp
    ret


read_tsc:
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rax
    movq $0, %rdx
    rdtsc
    shlq $32, %rdx
    addq %rdx, %rax

    movq %rbp, %rsp
    popq %rbp
    ret

handle_illegal_bird_position:
    #no pars
    #returns 0 if bird position is OK, 1 if bird position is illegal
    ##if bird position < 0 (above screen), position is reset and 0 is returned
    pushq %rbp
    movq %rsp, %rbp

    movq bird_objects, %r8
    addq OBJECT_POS_Y, %r8
    cmpq $0, (%r8) #check if bird is above screen
    jge bird_not_above_screen
    movq $0, (%r8) #set bird to top of screen
    bird_not_above_screen:
    #check for all pipes if there is a collision
    movq $pipe_check_collision_with_object, %rdi
    movq bird_objects, %rsi
    call pipe_manager_for_all_pipes
    movq $1, %rax
    cmpq $1, collision #the collision subroutine has set collision to 1 if there is a collision
    jge return_handle_illegal_bird_position
    #check if bird is below the ground
    movq bird_objects, %r8
    addq OBJECT_POS_Y, %r8
    movq $1, %rax
    cmpq $74000, (%r8)
    jg return_handle_illegal_bird_position
    ##if no illegal position, return 0
    movq $0, %rax
    return_handle_illegal_bird_position:
    movq %rbp, %rsp
    popq %rbp
    ret

