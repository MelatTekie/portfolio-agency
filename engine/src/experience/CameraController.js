import gsap from 'gsap';

export function createCameraController(camera) {
  const lookAtTarget = { x: 0, y: 1, z: 0 };

  // The camera aims slightly left of the object's actual position, pushing
  // it visually rightward on screen (clear of the content panel on the left).
  // This needs to scale with how far the camera is from the object —
  // a flat offset shifts closer objects a lot and distant ones barely at all.
  // Scaling by distance keeps the on-screen shift roughly consistent everywhere.
  const OFFSET_FRACTION = 0.32;

  function goTo(chapter, duration = 2, onComplete) {
    const dx = chapter.lookAt.x - chapter.position.x;
    const dz = chapter.lookAt.z - chapter.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const offsetX = -distance * OFFSET_FRACTION;

    gsap.to(camera.position, {
      x: chapter.position.x,
      y: chapter.position.y,
      z: chapter.position.z,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(lookAtTarget, {
      x: chapter.lookAt.x + offsetX,
      y: chapter.lookAt.y,
      z: chapter.lookAt.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
      },
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  return { goTo };
}
