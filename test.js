let str = `"Kushi Tsuru","Mon-Sun 11:30 am - 9 pm"
"Osakaya Restaurant","Mon-Thu, Sun 11:30 am - 9 pm  / Fri-Sat 11:30 am - 9:30 pm"`;

console.log(str);
str = str.split(/\r?\n/);
console.log("str1", str[0]);
str = str[0];
str = str.split(",");
console.log("str1", str[0]);
// console.log("str1", str[0]);
