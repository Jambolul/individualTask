interface Course{
    name: string;
    price: string;
    diets: string;
}

interface DailyMenu{
    _id: string;
    courses: Course[];

}

export type {DailyMenu}
