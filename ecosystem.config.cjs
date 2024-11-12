module.exports = {
  apps : [
      {
            name:"yun-trip-book-dev",
            script:"/yun_trip_book/index.js",
            env:{
                NODE_ENV:"development",
                PORT:3000
            }
        },
        {
            name:"yun-trip-book-prod",
            script:"/yun_trip_book/index.js",
            env:{
                NODE_ENV:"production",
                PORT:8080
            }
        }
  ],

  
};
