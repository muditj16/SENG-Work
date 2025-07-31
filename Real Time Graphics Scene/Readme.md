Mudit Jaswal
Assignment 2 - CSC 305	


Description:
This scene shows Earth orbiting the Sun with the Moon orbiting Earth. Suddenly, an asteroid crashes into Earth. The impact causes both Earth and the Moon to explode. This scene also features a three level hierarchical object (ufo) moving in space. I have used lab 7 code as template and have referred to Illuminations lecture pdf for fragment shader.

https://github.com/user-attachments/assets/0f254c6d-0792-4258-811d-b4c6cc527517


Working
1. UFO moving in space is atleast three level hierarchical object. 
-At least one hierarchical object of at least three levels in the hierarchy  (e.g. human arm body -> shoulder -> elbow ...) where joint motion clearly shows the interaction between levels. A good example of this is the legs in A1, note that legs in A2 will not count (you can not simply use the legs to fulfill this requirement).

2. The camera stays at the origin and does a 360 fly around at the very end of the scene.
-360-degree camera fly around using lookAt() and setMV() to move the camera in a circle while focusing on a point that the camera is circling. This can be a single fly around or can be a part of a composed scene or can be a loop.

3. Real time connection accomplished in the render() function.

4.There are multiple textures either procedural or mapped. For example, sun, earth, ufo, stars.

5. Completed in HTML file. 
-Convert the ADS shader in the assignment base code from a vertex shader to a fragment shader. You need to compute the lighting equation per fragment.

6.Completed in HTML file.
-Convert the Phong to Blinn-Phong in the new fragment shader created in step 3.

7. Shader effect: star twinkle
- The star twinkle effect creates a dynamic, time-based blinking of stars, similar to how stars appear to twinkle in the night sky. The twinkling is achieved by modifying the visibility of the star texture based on a cosine function that oscillates over time. This effect uses the time variable to control the blinking, making the stars appear and disappear at random intervals, creating a visually appealing "twinkle" effect.
