/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_strdup.c                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: azhultay <marvin@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/29 12:21:15 by azhultay          #+#    #+#             */
/*   Updated: 2025/07/31 13:45:22 by azhultay         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

char	*ft_strcpy(char *dest, char *src)
{
	int	i;

	i = 0;
	while (src[i] != '\0')
	{
		dest[i] = src[i];
		i++;
	}
	dest[i] = '\0';
	return (dest);
}

int	len(char *str)
{
	int	n;

	n = 0;
	while (str[n] != '\0')
	{
		n++;
	}
	return (n);
}

char	*ft_strdup(char *src)
{
	char	*res;

	res = malloc(sizeof(char) * len(src)+1);
	ft_strcpy(res, src);
	return (res);
}
/*
int	main(void)
{
	char	*s;
	char	*res1;
	char	*res2;

	s="PID 16637 Segmentation Fault !";
	res1 = ft_strdup(s);
	res2 = strdup(s);
	printf("%s\n%s", res1, res2);
	free(res1);
	free(res2);
	return (0);
}
*/
