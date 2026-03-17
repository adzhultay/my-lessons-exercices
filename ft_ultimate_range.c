/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_ultimate_range.c                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: azhultay <marvin@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/29 17:36:31 by azhultay          #+#    #+#             */
/*   Updated: 2025/07/30 18:07:34 by azhultay         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
#include <stdlib.h>

int	ft_ultimate_range(int **range, int min, int max)
{
	int	i;
	int	*arr;
	int	size;

	if (min >= max)
	{
		*range = NULL;
		return (0);
	}
	size = max - min;
	arr = (int *)malloc(size * sizeof(int));
	if (!arr)
		return (-1);
	i = 0;
	while (min < max)
	{
		arr[i] = min;
		i++;
		min++;
	}
	*range = arr;
	return (size);
}
/*
#include <stdio.h>

int main(int ac, char **av)
{
	int	size;
	int	*t_range;
	int	i;
	
	if (ac == 3)
	{
		size = ft_ultimate_range(&t_range, atoi(av[1]), atoi(av[2]));
		printf("%d\n", size);
		for (i = 0; i < size; i++)
			printf("%d ", t_range[i]);
		printf("\n");
		free(t_range);
	}
	return 0;
}*/
