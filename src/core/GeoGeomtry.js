import * as THREE from 'three'

/**
 * 基于GEOJSON数据创建建筑白膜
 */
export default class GeoGeometry {
    defaultOptions = {
        color: 0x3399ff,
        polygonLine: true,
        heritage: 8
    }
    /**
     * 构造函数
     * @param {*} data geojson数据对象
     */
    constructor(data, options) {
        this.options = Object.assign(this.defaultOptions, options)
        this.geojson = data
        this.coordinateTransformer = null
        this.heightTransformer = function () {
            return parseInt(Math.random() * 4)
        }
        this.group = new THREE.Object3D()
        this.mesh = null
    }

    setHeightTranformer(setHeightTranformer) {
        this.heightTransformer = setHeightTranformer
    }
    /**
     *
     * @param {*} coordinateTransformer ([lng,lat])=>[x,y]
     */
    setCoordinateTranformer(coordinateTransformer) {
        this.coordinateTransformer = coordinateTransformer
    }

    /**
     * 创建3d模型
     */
    build() {
        const features = this.geojson.features
        features.forEach((feature) => {
            if (feature.geometry) {
                this.draw(feature)
            }
        })
        this.mesh = this.group
    }

    draw(feature) {
        switch (feature.geometry.type) {
            case 'LineString':
                this.drawLine(feature)
                break
            case 'MultiPolygon':
                this.drawMultiPolygon(feature)
                break
            case 'Polygon':
                this.drawPolygon(feature)
                break
            default:
                break
        }
    }

    /**
     * 线段绘制、绘制道路
     * @param {*} feature
     */
    drawLine(feature) {
        var coordinates = feature.geometry.coordinates
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        })
        const points = []
        coordinates.map((row) => {
            const [x, y, z] = this.coordinateTransformer(row)
            points.push(new THREE.Vector3(x, y, z || 0))
        })

        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(geometry, material)
        this.group.add(line)
    }

    /**
     * 绘制多边形
     * @param {*} feature
     */
    drawPolygon(feature) {
        var coordinates = feature.geometry.coordinates
        const height = this.heightTransformer(feature)
        this.drawPolygonMesh(coordinates, feature, height)
    }

    /**
     * 绘制多个多边形
     * @param {*} feature
     */
    drawMultiPolygon(feature) {
        var coordinates = feature.geometry.coordinates
        const height = this.heightTransformer(feature)
        coordinates.forEach((coordinate) => {
            this.drawPolygonMesh(coordinate, feature, height)
        })
    }

    /**
     * 绘制多边形Mesh
     * @param {*} coordinates
     * @param {*} height
     */
    drawPolygonMesh(coordinates, feature, height) {
        coordinates.forEach((coordinate) => {
            const mesh = this.drawExtrudeMesh(coordinate, height)
            mesh.properties = feature
            mesh.name = 'geojson-shape'
            this.group.add(mesh)
            if (this.options.polygonLine) {
                const lineMesh = this.drawPolygonLine(coordinate,height)
                this.group.add(lineMesh)
            }
        })
    }

    /**
     * 根据经纬度坐标生成ExtrudeMesh
     * @param {*} coordinates 经纬度坐标
     * @param {*} height 拉伸高度
     * @returns
     */
    drawExtrudeMesh(coordinates, height) {
        const shape = new THREE.Shape()
        coordinates.forEach((row, i) => {
            const [x, y, z] = this.coordinateTransformer(row)
            if (i === 0) {
                shape.moveTo(x, y, z || 0)
            }
            shape.lineTo(x, y, z || 0)
        })

        // 拉伸
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false
        })

        // const material = new THREE.MeshBasicMaterial({
        //     color: this.options.color
        // })
        const material = new THREE.MeshStandardMaterial({
            color: this.options.color,
            emissive: 0x000000,
            roughness: 0.45,
            metalness: 0.8,
            transparent: true,
            side: THREE.DoubleSide
        })
        return new THREE.Mesh(geometry, material)
    }

    drawPolygonLine(polygon,height) {
        const lineGeometry = new THREE.BufferGeometry()
        const pointsArray = new Array()
        polygon.forEach((row) => {
            const [x, y] = this.coordinateTransformer(row)
            pointsArray.push(new THREE.Vector3(x, y,height))
        })
        lineGeometry.setFromPoints(pointsArray)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xfff000
        })
        return new THREE.Line(lineGeometry, lineMaterial)
    }
}
