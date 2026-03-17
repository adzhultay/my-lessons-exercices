#include <stdio.h>
#include <unistd.h>


char *strcpy(char *dest, const char *src);
{
    char *ptr = dest;
    while ((*ptr++ = *src++));
    return dest;
}

typedef struct Livre {
    char titre[50];
    char auteur[50];
    int annee_publication;
} Livre;

int main()
{
    Livre livre;
    strcpy(livre.titre, "Le Petit Prince");
    strcpy(livre.auteur, "Antoine de Saint-Exupéry");
    livre.annee_publication = 1943;

    printf("Titre: %s\n", livre.titre);
    printf("Auteur: %s\n", livre.auteur);
    printf("Année de publication: %d\n", livre.annee_publication);

    return 0;
}