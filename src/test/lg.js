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

export function latLonToVector3(x, y) {
    return {
        x: (x * d2r * a) / 10000,
        y: (geodeticLatitudeToMercatorAngle(y * d2r) * a) / 10000
    }
}
