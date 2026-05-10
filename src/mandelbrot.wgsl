struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Transform screen coordinates to complex plane using uniforms
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            2.0 * z.x * z.y + c.y
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}