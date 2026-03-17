/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_range.c                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: azhultay <marvin@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/29 16:09:06 by azhultay          #+#    #+#             */
/*   Updated: 2025/07/31 14:48:22 by azhultay         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <stdio.h>
#include <stdlib.h>

int	*ft_range(int min, int max)
{
	int	*res;
	int	i;

	i = 0;
	if (min >= max)
		return (NULL);
	res = malloc(sizeof(int) * (max - min));
	if (!res)
		return (NULL);
	while (min < max)
	{
		res[i] = min;
		min++;
		i++;
	}
	return (res);
}
int	main(void)
{
	int	*res;

	res = ft_range(66, 70);
	int i = 0;
	while (res[i])
	{
		printf("%d\n", res[i]);
		i++;
	}
	free(res);
}
