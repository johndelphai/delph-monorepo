'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LandingHeroCanvas() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        let disposed = false;

        let scene: THREE.Scene | null = null;
        let camera: THREE.OrthographicCamera | null = null;
        let renderer: THREE.WebGLRenderer | null = null;
        let mesh: THREE.Mesh | null = null;
        let material: THREE.ShaderMaterial | null = null;

        try {
            scene = new THREE.Scene();
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            });
            renderer.setClearColor(0x000000, 0);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            mount.appendChild(renderer.domElement);
        } catch (error) {
            console.error('Landing shader init failed', error);
            return;
        }

        const uniforms = {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
            uColorA: { value: new THREE.Color('#d8d2c6') }, // wall base
            uColorB: { value: new THREE.Color('#cfc7b8') }, // wall shadow tone
            uColorC: { value: new THREE.Color('#f5f1e9') }, // light shaft highlight
            uWater: { value: new THREE.Color('#bcc8c5') }, // pool tint
        };

        material = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                uniform vec3 uColorC;
                uniform vec3 uWater;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    float t = uTime * 0.45;

                    // Wall: bright near top, warmer/darker near horizon.
                    float wallGrad = smoothstep(1.0, 0.18, uv.y);
                    vec3 wall = mix(uColorA, uColorB, wallGrad);

                    // Perspective-skewed shaft coordinate (to mimic sunlight angle).
                    float sx = uv.x + (uv.y * 0.16);
                    float shaft1 = exp(-pow((sx - 0.10) / 0.09, 2.0));
                    float shaft2 = exp(-pow((sx - 0.34) / 0.11, 2.0));
                    float shaft3 = exp(-pow((sx - 0.60) / 0.13, 2.0));
                    float shaft4 = exp(-pow((sx - 0.84) / 0.16, 2.0));

                    // Gentle temporal drift to avoid static look.
                    float drift = sin((uv.y * 4.0) - (t * 0.9)) * 0.02;
                    float shafts = max(max(shaft1, shaft2), max(shaft3, shaft4));
                    shafts = smoothstep(0.18 + drift, 0.9 + drift, shafts);

                    // Blend bright light beams and soft shadowing.
                    vec3 litWall = mix(wall, uColorC, shafts * 0.48);
                    float shadowBands = smoothstep(0.25, 0.8, sin((sx * 14.0) + 0.4) * 0.5 + 0.5) * 0.12;
                    litWall = mix(litWall, uColorB, shadowBands);

                    // Ledge and water split.
                    float ledgeY = 0.36;
                    float wallMask = smoothstep(ledgeY + 0.02, ledgeY + 0.06, uv.y);

                    // Water base.
                    vec3 water = mix(uWater, uColorA, smoothstep(0.0, ledgeY, uv.y) * 0.2);

                    // Animated ripples.
                    float rx = uv.x * 55.0;
                    float ry = uv.y * 28.0;
                    float rippleA = sin(rx - (t * 5.2) + ry) * 0.5 + 0.5;
                    float rippleB = sin((rx * 0.72) + (t * 4.0) + (ry * 1.3)) * 0.5 + 0.5;
                    float rippleMix = (rippleA * 0.58) + (rippleB * 0.42);
                    float rippleLines = smoothstep(0.68, 1.0, rippleMix) * (1.0 - smoothstep(0.0, ledgeY + 0.03, uv.y));

                    // Reflection of shafts into water.
                    float reflected = shafts * (1.0 - smoothstep(0.0, ledgeY + 0.1, uv.y));
                    water = mix(water, uColorC, rippleLines * 0.42 + reflected * 0.14);

                    // Thin ledge highlight line.
                    float ledgeLine = smoothstep(ledgeY - 0.005, ledgeY + 0.002, uv.y) - smoothstep(ledgeY + 0.002, ledgeY + 0.01, uv.y);

                    vec3 color = mix(water, litWall, wallMask);
                    color = mix(color, uColorC, ledgeLine * 0.35);

                    // Soft cinematic vignette.
                    vec2 c = uv - 0.5;
                    float vignette = smoothstep(1.08, 0.2, length(c * vec2(1.0, 0.88)));
                    color *= 0.94 + (0.1 * vignette);

                    gl_FragColor = vec4(color, 0.99);
                }
            `,
        });
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);

        const clock = new THREE.Clock();
        let frame = 0;

        const onResize = () => {
            const { clientWidth, clientHeight } = mount;
            if (!renderer) return;
            renderer.setSize(clientWidth, clientHeight);
            uniforms.uResolution.value.set(clientWidth, clientHeight);
        };

        const tick = () => {
            if (disposed || !renderer || !scene || !camera || !mesh) return;
            uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            frame = window.requestAnimationFrame(tick);
        };

        window.addEventListener('resize', onResize);
        onResize();
        tick();

        return () => {
            disposed = true;
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
            if (scene && mesh) {
                scene.remove(mesh);
                mesh.geometry.dispose();
            }
            material?.dispose();
            renderer?.dispose();
            if (renderer?.domElement.parentElement === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0" aria-hidden>
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 42%), radial-gradient(circle at 82% 76%, rgba(237,233,224,0.35), transparent 52%), #d7d0c4',
                }}
            />
            <div ref={mountRef} className="absolute inset-0" />
        </div>
    );
}
