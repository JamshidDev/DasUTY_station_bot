
let permission=[
    {
        name:"MTU - 1",
        role_name:"station_noden",
        role_id:7,
    },
    {
        name:"MTU - 2",
        role_name:"station_noden",
        role_id:2,
    },
    {
        name:"MTU - 3",
        role_name:"station_noden",
        role_id:3,
    },
    {
        name:"MTU - 4",
        role_name:"station_noden",
        role_id:4,
    },
    {
        name:"MTU - 5",
        role_name:"station_noden",
        role_id:5,
    },
    {
        name:"MTU - 6",
        role_name:"station_noden",
        role_id:6,
    },
    {
        name:"Stansiya DSlar",
        role_name:"station_ds",
        role_id:1,
    },
];

const wagon_type_list =[
    {
        name:'Крытый(1 дверный)',
        id:1,
    },
    {
        name:'Крытый(2х дверный)',
        id:2,
    },
    {
        name:'Полувагон(глуходонные)',
        id:3,
    },
    {
        name:'Полувагон(люковый)',
        id:4,
    },
    {
        name:'Цистерна(4х осьные)',
        id:5,
    },
    {
        name:'Цистерна(8х осьные)',
        id:6,
    },
    {
        name:'Зерновоз',
        id:7,
    },
    {
        name:'Цементовоз',
        id:8,
    },
    {
        name:'Платформа',
        id:9,
    },
    {
        name:'Битумный',
        id:10,
    },
    {
        name:'Ледник',
        id:11,
    },
    {
        name:'Рефрижераторный(Автономный)',
        id:12,
    },
    {
        name:'Контейнеровоз',
        id:13,
    },


];

const wagon_order_time = [
    {
        id:0,
        name:"Evening"
    },
    {
        id:1,
        name:"Morning"
    },
]


module.exports = {wagon_type_list, permission} ;