/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_strjoin.c                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: azhultay <azhultay@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/20 18:32:25 by azhultay          #+#    #+#             */
/*   Updated: 2025/07/31 14:54:43 by azhultay         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <stdlib.h>

int	ft_strlen(char *str)
{
	int	n;

	n = 0;
	while (str[n] != '\0')
	{
		n++;
	}
	return (n);
}

char	*ft_strcat(char *dest, char *src)
{
	int	len_d;
	int	len_s;
	int	i;

	len_d = ft_strlen(dest);
	len_s = ft_strlen(src);
	i = 0;
	while (i <= len_s)
	{
		dest[len_d + i] = src[i];
		i++;
	}
	return (dest);
}

int	s_malloc(int size, char **strs, char *sep)
{
	int	i;
	int	len;

	i = 0;
	len = 0;
	while (i < size)
	{
		len += ft_strlen(strs[i]);
		i++;
	}
	len += (size - 1) * ft_strlen(sep);
	return (len);
}

char	*ft_strjoin(int size, char **strs, char *sep)
{
	int		i;
	int		len;
	char	*str;

	i = 0;
	len = s_malloc(size, strs, sep);
	if (size <= 0)
	{
		str = malloc(sizeof(char));
		str[0] = '\0';
		return (str);
	}
	else
	{
		str = malloc(sizeof(char) * (len + 1));
		str[0] = '\0';
	}
	while (i < size)
	{
		ft_strcat(str, strs[i]);
		if (i != size - 1)
			ft_strcat(str, sep);
		i++;
	}
	return (str);
}

int	main(void)
{
	char	*strs[] = {"Segmentation",
	"fault", "test", "test"};
	char	*sep = " ";
	char	*chain = ft_strjoin(6, strs, sep);

	__builtin_printf("%s\n",chain);
	free(chain);
	return (0);
}