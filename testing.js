/**
 * Created by Zein's on 6/19/2016.
 */
//Example input 'key'

console.log(getvalue("http://youtube.com/&key=JDJDI&user=zein", "user"));
function getvalue(request, key){
    return request.split("&" + key + "=")[1].split("&")[0];
}
