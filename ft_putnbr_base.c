/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_putnbr_base.c                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: azhultay <marvin@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 14:56:26 by azhultay          #+#    #+#             */
/*   Updated: 2025/07/24 20:12:08 by azhultay         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
#include <unistd.h>

int    len_str(char *str)
{
    int    i;

    i = 0;
    while (str[i])
        i++;
    return(i);
}




void    ft_putnbr_base(int nbr, char *base)
{
    int    len_base;

    len_base = len_str(base);
    if (nbr == -2147483648)
    {
        write(1, "-2147483648", 11);
        return ;
    }
    if (nbr < 0)
    {
        write(1, "-", 1);
        nbr = -nbr;
    }
    if (nbr >= len_base)
    {
        ft_putnbr_base(nbr / len_base, base);
    }
    write(1, &base[nbr % len_base], 1);
}

int    main(void)
{
    ft_putnbr_base(5484842, "64abcdef");

}
