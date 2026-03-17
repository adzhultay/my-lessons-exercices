#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

typedef struct Snake Snake;

struct Snake {
    int x;
    int y;
    int length;
    int status; // 0 for alive, 1 for dead
    char direction; // 'U', 'D', 'L', 'R'
};


void **ft_snake(void)
{
void print_board(char str[10][10], Snake snake)
{
    for (int y = 0; y < 10; y++) {
        for (int x = 0; x < 10; x++) {
            if (x == snake.x && y == snake.y)
                printf("O"); // Affiche le serpent
            else
                printf("%c", str[y][x]);
        }
        printf("\n");
    }
}
    char str[10][10] = {
        "##########",
        "#        #",
        "#        #",
        "#        #",
        "#        #",
        "#        #",  
        "#        #",
        "#        #", 
        "#        #",
        "##########"
    };
    
    Snake snake;
    // Initialize the snake

    snake.status = 0;
    snake.x = 1; // Starting x position
    snake.y = 1; // Starting y position
    snake.length = 1; // Initial length of the snake
    snake.direction = 'R'; // Initial direction of the snake
    // Initialize the game area


    while (snake.status == 0) {
        if (snake.direction == 'U') {
            snake.y--;
        } else if (snake.direction == 'D') {
            snake.y++;
        } else if (snake.direction == 'L') {
            snake.x--;
        } else if (snake.direction == 'R') {
            snake.x++;
        }
        scanf("%c", &snake.direction); // Get the next direction input


        if (snake.x < 0 || snake.y < 0 || str[snake.y][snake.x] == '#') {
            snake.status = 1; // Snake is dead
        }
    }

    
    if (snake.status == 1) {
        printf("Game Over! Snake is dead.\n");
    } else {
        printf("Snake survived!\n");
    }
}


int main(void)
{
    char direction;
    int life = 1;

    while (life) {
        printf("Enter direction (U/D/L/R): ");
        scanf(" %c", &direction); // Space before %c to ignore any whitespace
        if (direction != 'U' && direction != 'D' && direction != 'L' && direction != 'R') 
        {
            printf("Invalid direction! Please enter U, D, L, or R.\n");
            continue;
        }
        print_board(str, snake);
        life = 0; // Exit after one valid input for demonstration
    }
    ft_snake();

    return 0;
}