// vertex_shader.wgsl
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    // Define the three corners of the triangle manually
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),   // Top
        vec2<f32>(-0.5, -0.5), // Bottom Left
        vec2<f32>(0.5, -0.5)   // Bottom Right
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Calculate distance from center (0, 0)
    let dist = length(in.worldPos);
    
    // Use distance to modulate red color (closer to center = brighter red)
    let red = 1.0 - dist;
    
    return vec4<f32>(red, 0.0, 0.0, 1.0); // Varying Red (RGBA)
}