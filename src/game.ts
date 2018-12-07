const point1 = new Vector3(5, 0, 5)
const point2 = new Vector3(5, 0, 10)
const point3 = new Vector3(5, 0, 15)
const point4 = new Vector3(10, 0, 15)
const point5 = new Vector3(15, 0, 15)
const point6 = new Vector3(15, 0, 5)
const point7 = new Vector3(15, 0, 10)

const myPath: Vector3[] = [point1, point2, point3, point4, point5, point6]

// how many frames to walk each path segment
const speed = 120

// how many frames to pause in between
const rest = 30

@Component("pathData")
export class PathData {
  previousPos: Vector3 = myPath[0]
  target: Vector3 = myPath[1]
  fraction: number = 0
  nextPathIndex: number = 1
  walking: boolean = true
  remainingRest: number = rest
}

export class PatrolPath {
  update() {
    let transform = gnark.get(Transform)
    let path = gnark.get(PathData)
    //let rotate = gnark.get(RotateData)
    if (path.walking){
      if (path.fraction < 1) {
        transform.position = Vector3.Lerp(
          path.previousPos,
          path.target,
          path.fraction
          )
        path.fraction += 1 / speed
      } else{
        path.walking = false
      }
    }
    else
    {
      if (path.remainingRest < 0){
        path.remainingRest -= 1
      }
      else{
        path.remainingRest = rest
        path.walking = true
        // get the next target
        path.nextPathIndex += 1
        if (path.nextPathIndex >= myPath.length) {
          path.nextPathIndex = 0
        }
        path.previousPos = path.target
        path.target = myPath[path.nextPathIndex]
        path.fraction = 0
        // turn Gnark in the direction of the next point
        transform.lookAt(path.target)
      }
    }
  }
}

engine.addSystem(new PatrolPath())

// Add Gnark
let gnark = new Entity()
gnark.set(new Transform())
gnark.get(Transform).position.set(5, 3, 5)
gnark.get(Transform).scale.setAll(0.5)
gnark.set(new GLTFShape("models/Pirate.glb"))

// Add animations
//const clipSwim = new AnimationClip("swim")
//gnark.get(GLTFShape).addClip(clipSwim)

// Activate swim animation
//clipSwim.play()

// add a path data component
gnark.set(new PathData())
//gnark.set(new RotateData())
gnark.get(Transform).lookAt(myPath[1])

// Add shark to engine
engine.addEntity(gnark)






///////////////

// Add 3D model for scenery
const castle = new Entity()
castle.add(new GLTFShape("models/Pirate_Ground.gltf"))
castle.add(new Transform())
castle.get(Transform).position.set(10, 0, 10)
//castle.get(Transform).scale.setAll(0.5)
engine.addEntity(castle)
