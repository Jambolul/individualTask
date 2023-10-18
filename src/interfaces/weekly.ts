interface Course{
    name: string;
    price: string;
    diets: string;
}

interface days{
    date:string;
    courses: Course[];

}
interface WeeklyMenu{
    _id: string;
    days:days[];


}
export type {WeeklyMenu}
