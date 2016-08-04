function hashCode(key) {
    var hash = 0;
    if(key.length == 0) return 0;
    for (var i = 0; i < key.length; i++) {
        var char = key.charCodeAt(i);
        hash += (char - 65) * Math.pow(26, (key.length - 1) - i);
    }
    return hash;
}
//83 67 82 70 86
//8272363
//11881376
//11881375
console.log(hashCode("ZZZZZ"));

//AAAAA = 0
//AAAAB = 1
//ZZZZZ = 11881375