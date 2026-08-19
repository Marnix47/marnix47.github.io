.data

pipe_manager:
    .quad 9 #index of highest (newest) pipe
    .quad 0 #index of lowest (oldest) pipe
    .quad 0 #amount of pipes
    .skip 400 #10 addresses

PIPE_MANAGER_HIGH_INDEX: .quad 0 #'points' to newest pipe
PIPE_MANAGER_LOW_INDEX: .quad 8
PIPE_MANAGER_AMOUNT: .quad 16
PIPE_MANAGER_STRUCTS: .quad 24

struct_pipe:
    .quad -800 ##250 mP/c, across the screen in 8 seconds
    .quad 0
    .quad 80000 #right of the screen
    .quad 0
    .quad 0 #to be determined randomly
    .quad 0 #to be set in the 'constructor'

.text

new_pipe:
    #no pars
    #return: pointer to object, which is also stored in the pipe_manager struct
    #returns null pointer if pipe struct storage is out of space
    pushq %rbp
    movq %rsp, %rbp

    call pipe_manager_reserve_new
    movq %rax, %r8 #r8 holds the pointer to the new struct (or a null pointer)
    movq $0, %rax
    cmpq $0, %r8
    je return_new_pipe

    #load properties into the new struct
    movq $struct_pipe, %r9

    movq %r9, %r10
    addq OBJECT_SPEED_X, %r10
    movq (%r10), %rdi
    movq %r8, %r11
    addq OBJECT_SPEED_X, %r11
    movq %rdi, (%r11)

    movq %r9, %r10
    addq OBJECT_SPEED_Y, %r10
    movq (%r10), %rdi
    movq %r8, %r11
    addq OBJECT_SPEED_Y, %r11
    movq %rdi, (%r11)

    movq %r9, %r10
    addq OBJECT_POS_X, %r10
    movq (%r10), %rdi
    movq %r8, %r11
    addq OBJECT_POS_X, %r11
    movq %rdi, (%r11)

    #get a random number and convert it into a y_pos
    pushq %r8
    pushq %r9
    call read_tsc #get a pseudo-pseudo-random number
    popq %r9
    popq %r8
    #height has to be negative (top left is above the screen)
    #height is min -50, max -10 (pipes have height 60)
    movq $40000, %r10
    cqo
    div %r10 #divide rax by 40, remainder stored in rdx
    subq $55000, %rdx
    movq %r8, %r11
    addq OBJECT_POS_Y, %r11
    movq %rdx, (%r11)

    #set render_info_struct pointer
    movq %r8, %r11
    addq OBJECT_RENDER_INFO, %r11
    movq $render_info_pipe, (%r11)

    movq %r8, %rax #return pointer to new struct
    movq $0, cumulative_distance_since_last_pipe_added #reset cumulative_distance

    return_new_pipe:
    movq %rbp, %rsp
    popq %rbp
    ret

pipe_manager_reserve_new:
    #no pars
    #return value: pointer to new pipe, null pointer when there are too many pipes
    pushq %rbp
    movq %rsp, %rbp

    movq $pipe_manager, %rcx
    addq PIPE_MANAGER_AMOUNT, %rcx
    incq (%rcx) #increase amount of pipes
    
    movq $0, %rax
    movq $pipe_manager, %rcx
    addq PIPE_MANAGER_AMOUNT, %rcx
    cmpq $10, (%rcx) #if there are too many pipes, return null pointer
    jg return_pipe_manager_reserve_new

    #increment high index, account for roll-back
    movq $pipe_manager, %rcx
    addq PIPE_MANAGER_HIGH_INDEX, %rcx
    incq (%rcx)
    cmpq $10, (%rcx)
    jne no_roll_back_high_index

    movq $0, (%rcx)
    no_roll_back_high_index:
    movq $40, %rax
    mulq (%rcx)
    addq $pipe_manager, %rax
    addq PIPE_MANAGER_STRUCTS, %rax #rax now points to the space for the new struct

    return_pipe_manager_reserve_new:
    movq %rbp, %rsp
    popq %rbp
    ret


pipe_manager_for_all_pipes:
    #calls a subroutine on all existing pipes
    #par1: pointer to subroutine
    #par2: a value to be passed with all calls of the subroutine (optional)
    #that subroutine takes 1 or 2 parameters: 
        #-the address of a pipe struct
        #-(optional) a 64-bit value
    pushq %rbp
    movq %rsp, %rbp
    pushq %r12
    pushq %r13
    pushq %r14
    pushq %r15

    movq %rdi, %r12
    movq %rsi, %r15
    movq $pipe_manager, %r8
    movq %r8, %r9
    addq PIPE_MANAGER_AMOUNT, %r9
    movq (%r9), %r13 #loop index
    movq %r8, %r9
    addq PIPE_MANAGER_LOW_INDEX, %r9
    movq (%r9), %r14 #pipe index in pipe_manager


    for_all_pipes_loop:
        cmpq $0, %r13 #check if all pipes have been looped over
        je end_for_all_pipes_loop

        #calculate address of current pipe struct, call subroutine
        movq $pipe_manager, %r8
        addq PIPE_MANAGER_STRUCTS, %r8 #r8 points to first struct
        movq %r14, %rax
        movq $40, %r9
        mulq %r9 #rax contains the offset
        addq %r8, %rax #rax points to the right struct
        movq %rax, %rdi
        movq %r15, %rsi
        call *%r12

        called_subroutine:
        incq %r14 #next pipe, account for roll-back
        cmpq $10, %r14
        js no_roll_back_pipe_index_for_all
        movq $0, %r14
        no_roll_back_pipe_index_for_all:
        decq %r13 #decrement loop index
        jmp for_all_pipes_loop

    end_for_all_pipes_loop:

    popq %r15
    popq %r14
    popq %r13
    popq %r12

    movq %rbp, %rsp
    popq %rbp
    ret

move_object:
    #par 1: pointer to object struct
    #no return
    
    pushq %rbp
    movq %rsp, %rbp

    movq %rdi, %r8
    // movq %rsi, %r9
    movq $1, %r9 #delta cycle_count = 1

    movq %r8, %rcx
    addq OBJECT_SPEED_X, %rcx
    movq (%rcx), %rax
    mulq %r9 #dpx = vx * t
    movq %r8, %rcx
    addq OBJECT_POS_X, %rcx
    movq (%rcx), %r10 #save old x pos
    addq %rax, (%rcx) #x_n = x_o + dx

    #check if pipe has passed bird (then increment score)
    cmpq $-4000, %r10
    jl no_score_increment
    cmpq $-4000, (%rcx)
    jge no_score_increment
    increment_score:
    incq current_score
    call pipe_manager_increment_speed

    no_score_increment:
    movq %r8, %rcx
    addq OBJECT_SPEED_Y, %rcx
    movq (%rcx), %rax
    mulq %r9 #dpy = vy * dt
    movq %r8, %rcx
    addq OBJECT_POS_Y, %rcx
    addq %rax, (%rcx) #y_n = y_o + dy
    
    movq %rbp, %rsp
    popq %rbp
    ret


pipes_handle_removal:
    #removes the oldest pipe if it should be removed
    pushq %rbp
    movq %rsp, %rbp

    movq $pipe_manager, %r8
    addq PIPE_MANAGER_LOW_INDEX, %r8
    movq (%r8), %rax #rax holds the index
    movq $40, %r9
    mulq %r9
    movq $pipe_manager, %r8
    addq PIPE_MANAGER_STRUCTS, %r8
    addq %rax, %r8
    movq %r8, %rdi
    call pipe_check_for_removal
    cmpq $0, %rax
    je return_pipes_handle_removal

    ##if object is out of frame, remove it:
    remove_pipe:
    movq $pipe_manager, %r9
    addq PIPE_MANAGER_AMOUNT, %r9
    decq (%r9)

    movq $pipe_manager, %r9
    addq PIPE_MANAGER_LOW_INDEX, %r9
    incq (%r9)
    cmpq $10, (%r9)
    jl return_pipes_check_for_removal
    movq $0, (%r9)

    return_pipes_handle_removal:
    movq %rbp, %rsp
    popq %rbp
    ret

pipe_check_for_removal:
    #par 1: pointer to pipe struct
    #returns 1 if it should be removed, 0 if not
    pushq %rbp
    movq %rsp, %rbp

    movq $0, %rax
    addq OBJECT_POS_X, %rdi
    cmpq $-14000, (%rdi) #pipe width = 14000, so it is out of frame when x_pos < -14000 mP
    jge return_pipes_check_for_removal
    movq $1, %rax
    
    return_pipes_check_for_removal:
    movq %rbp, %rsp
    popq %rbp
    ret

handle_cumulative_dist:
    #no pars, no return value
    #should be called once every cycle
    pushq %rbp
    movq %rsp, %rbp
    // addq $800, cumulative_distance_since_last_pipe_added
    movq $struct_pipe, %rcx
    addq OBJECT_SPEED_X, %rcx
    movq (%rcx), %rax
    negq %rax
    addq %rax, cumulative_distance_since_last_pipe_added
    cmpq $40000, cumulative_distance_since_last_pipe_added
    jl return_handle_cumulative_dist
    call new_pipe
    return_handle_cumulative_dist:
    movq %rbp, %rsp
    popq %rbp
    ret

pipe_check_collision_with_object:
    #par 1: pointer to pipe struct
    #par 2: pointer to object struct
    #returns: 1 for collision, 0 for no collision
    pushq %rbp
    movq %rsp, %rbp
    pushq %rdi
    pushq %rsi

    movq $0, %rax
    movq $1000, %r11

    check_collision_horizontally:
        check_right_collision:
        movq %rsi, %r8
        addq OBJECT_POS_X, %r8
        movq (%r8), %r8
        movq %rsi, %r10
        addq OBJECT_RENDER_INFO, %r10
        movq (%r10), %r10
        addq OBJECT_WIDTH, %r10
        movq (%r10), %rax
        incq %rax
        mulq %r11
        addq %rax, %r8 #r8 now contains the x-pos of the top right of object.

        movq %rdi, %r9
        addq OBJECT_POS_X, %r9

        movq $0, %rax
        cmpq %r8, (%r9)
        jg return_pipe_check_collision_with_object #if the object is compeletely left of the pipe, no further checking

        check_left_collision:
        movq (%r9), %r9 #r9 contains object_pos_x
        movq %rdi, %r10
        addq OBJECT_RENDER_INFO, %r10
        movq (%r10), %r10 
        addq OBJECT_WIDTH, %r10
        movq (%r10), %rax #rax contains pipe width
        mulq %r11
        addq %rax, %r9 #r9 now contains the x-pos of the top-right of pipe

        movq %rsi, %r8
        addq OBJECT_POS_X, %r8
        movq (%r8), %r8 #r8 now contains the x-pos of the top left of object

        movq $0, %rax
        cmpq %r8, %r9
        jl return_pipe_check_collision_with_object #if object is completely right of the pipe, no further checking

    check_collision_upper_pipe:
        #check if top of object is higher than y-pos of pipe + 60
        #so: check if y_obj < y_pipe + 60k
        movq %rsi, %r8
        addq OBJECT_POS_Y, %r8
        movq (%r8), %r8
        movq %rdi, %r9
        addq OBJECT_POS_Y, %r9
        movq (%r9), %r9
        addq $61000, %r9
        movq $1, %rax
        cmpq %r9, %r8
        jl return_pipe_check_collision_with_object

    check_collision_lower_pipe:
        #check if bottom of object is lower than y-pos of pipe + 85
        #so: check if y_obj + height_obj * 1000 < y_pipe + 85k
        movq %rsi, %r8
        addq OBJECT_POS_Y, %r8
        movq (%r8), %r8
        movq %rsi, %r10
        addq OBJECT_RENDER_INFO, %r10
        movq (%r10), %r10
        addq OBJECT_HEIGHT, %r10
        movq (%r10), %rax
        mulq %r11
        addq %rax, %r8

        movq %rdi, %r9
        addq OBJECT_POS_Y, %r9
        movq (%r9), %r9
        addq $86000, %r9
        movq $1, %rax
        cmpq %r9, %r8
        jg return_pipe_check_collision_with_object

    movq $0, %rax
    return_pipe_check_collision_with_object:
    addq %rax, collision
    movq %rbp, %rsp
    popq %rbp
    ret

pipe_manager_clear_all:
    pushq %rbp
    movq %rsp, %rbp

    movq $pipe_manager, %r8
    addq PIPE_MANAGER_AMOUNT, %r8
    movq $0, (%r8)

    movq $pipe_manager, %r8
    addq PIPE_MANAGER_LOW_INDEX, %r8
    movq $0, (%r8)

    movq $pipe_manager, %r8
    addq PIPE_MANAGER_HIGH_INDEX, %r8
    movq $9, (%r8)

    movq %rbp, %rsp
    popq %rbp
    ret

pipe_manager_reset_speed:
    #no pars, no return value
    pushq %rbp
    movq %rsp, %rbp

    movq $struct_pipe, %rcx
    addq OBJECT_SPEED_X, %rcx
    movq $-800, (%rcx)

    movq %rbp, %rsp
    popq %rbp
    ret

pipe_manager_increment_speed:
    #no pars, no return value
    pushq %rbp
    movq %rsp, %rbp

    movq $struct_pipe, %rcx
    addq OBJECT_SPEED_X, %rcx
    subq $20, (%rcx)

    movq %rbp, %rsp
    popq %rbp
    ret
