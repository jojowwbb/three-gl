function latLonToVector3(lat, lon, radius = 1, dimension = 3) {
    if (dimension === 3) {
        const phi = (lat * Math.PI) / 180
        const theta = ((360 - lon) * Math.PI) / 180

        return {
            x: radius * Math.cos(phi) * Math.cos(theta),
            y: radius * Math.sin(phi),
            z: radius * Math.cos(phi) * Math.sin(theta)
        }
    } else {
        return {
            x: (radius * lon) / 180,
            y: (radius * lat) / 180,
            z: 0
        }
    }
}

// lon 经度，西经为负数
// lat 纬度，南纬是负数
function millerXY(lon, lat, scale) {
    var L = 6381372 * Math.PI * 2, // 地球周长
        W = L, // 平面展开后，x轴等于周长
        H = L / 2, // y轴约等于周长一半
        mill = 2.3, // 米勒投影中的一个常数，范围大约在正负2.3之间
        x = (lon * Math.PI) / 180, // 将经度从度数转换为弧度
        y = (lat * Math.PI) / 180 // 将纬度从度数转换为弧度
    // 这里是米勒投影的转换
    y = 1.25 * Math.log(Math.tan(0.25 * Math.PI + 0.4 * y))
    // 这里将弧度转为实际距离
    x = W / 2 + (W / (2 * Math.PI)) * x
    y = H / 2 - (H / (2 * mill)) * y
    // 转换结果的单位是公里
    // 可以根据此结果，算出在某个尺寸的画布上，各个点的坐标
    return {
        x: x * scale,
        y: y * scale
    }
}

function test() {
    const epsilon = 0.000000000000001
    const pi = 3.14159265358979323846
    const d2r = pi / 180
    const r2d = 180 / pi

    const a = 6378137.0 //椭球长半轴
    const f_inverse = 298.257223563 //扁率倒数
    const b = a - a / f_inverse
    //const double b = 6356752.314245;			//椭球短半轴

    const e = Math.sqrt(a * a - b * b) / a

    //墨卡托范围[-PI, PI]->大地纬度范围[-PI/2, PI/2]
    function mercatorAngleToGeodeticLatitude(mercatorAngle) {
        return pi / 2.0 - 2.0 * Math.atan(Math.exp(-mercatorAngle))
    }

    //Web墨卡托投影所支持的最大纬度（北和南）
    const maximumLatitude = mercatorAngleToGeodeticLatitude(pi)

    //大地纬度范围[-PI/2, PI/2]->墨卡托范围[-PI, PI]
    function geodeticLatitudeToMercatorAngle(latitude) {
        if (latitude > maximumLatitude) {
            latitude = maximumLatitude
        } else if (latitude < -maximumLatitude) {
            latitude = -maximumLatitude
        }
        const sinLatitude = Math.sin(latitude)
        return 0.5 * Math.log((1.0 + sinLatitude) / (1.0 - sinLatitude))
    }

    function Blh2Wmc(x, y, z) {
        x = x * d2r * a
        y = geodeticLatitudeToMercatorAngle(y * d2r) * a
    }
}

console.log(latLonToVector3(102.72181185, 25.05158937))
console.log(millerXY(102.72181185, 25.05158937, 1 / 10000000))
