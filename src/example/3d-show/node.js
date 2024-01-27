var test = '{()}'

function valid(data) {
    var map = {
        '(': ')',
        '{': '}',
        '[': ']'
    }

    var stack = []

    for (var i = 0; i < data.length; i++) {
        var el = data[i]
        console.log(el)
        if (map[el]) {
            stack.push(el)
        } else {
            if (!stack.length || map[stack.pop()] != el) {
                return false
            }
        }
    }
    return !stack.length
}

console.log(valid(test))
