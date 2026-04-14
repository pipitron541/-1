import math

while True:
    print("\nВыбери задание:")
    print("1 - Логарифмический калькулятор")
    print("2 - Определить положение точки")
    print("3 - Время падения камня")
    print("0 - Выход")

    choice = input("Твой выбор: ")

    if choice == "1":
        print("\nЛогарифмический калькулятор")

        a = float(input("Введите число: "))
        b = float(input("Введите основание: "))

        if a > 0 and b > 0 and b != 1:
            print("Ответ:", math.log(a, b))
        else:
            print("Ошибка: неправильные числа")

    elif choice == "2":
        print("\nОпределение положения точки")

        x = float(input("Введите x: "))
        y = float(input("Введите y: "))

        if x > 0 and y > 0:
            print("1 четверть")
        elif x < 0 and y > 0:
            print("2 четверть")
        elif x < 0 and y < 0:
            print("3 четверть")
        elif x > 0 and y < 0:
            print("4 четверть")
        elif x == 0 and y == 0:
            print("Начало координат")
        elif x == 0:
            print("На оси Y")
        elif y == 0:
            print("На оси X")

    elif choice == "3":
        print("\nПадение камня")

        h = float(input("Введите высоту: "))
        g = 9.8

        if h >= 0:
            t = math.sqrt((2 * h) / g)
            print("Время падения:", t)
        else:
            print("Высота не может быть отрицательной")

    elif choice == "0":
        print("Пока!")
        break

    else:
        print("Неправильный выбор")