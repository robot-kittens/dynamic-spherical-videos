
#define FACE_QUAD_SIZE
#define FACE_QUAD_SIZE_WITH_CENTERING

// faceIdx is face number 0:back, 1:left 2:front 3:right 4:top 5:bottom
vec3 getFaceUVW(vec2 uv, float faceIdx, vec2 faceSize)
{
    float a = 2.0*uv.x/faceSize.x;
    float b = 2.0*uv.y/faceSize.y;
    	 if (faceIdx<0.5) return vec3(-1., 	1.-a, 3.-b);// back
    else if (faceIdx<1.5) return vec3(a-3., -1.,  3.-b);// left
    else if (faceIdx<2.5) return vec3(1., 	a-5., 3.-b);// front
    else if (faceIdx<3.5) return vec3(7.-a, 1.,   3.-b);// right
    else if (faceIdx<4.5) return vec3(b-1., a-5., 1.  );// top
    					  return vec3(5.-b, a-5., -1. );// bottom
}
        
vec2 EquiRectToCubeMap(vec2 uv)
{
    vec2 gridSize = vec2(4,3); // 4 faces on x, and 3 on y
	vec2 faceSize = 1.0 / gridSize; // 1.0 because normalized coords
    vec2 faceIdXY = floor(uv * gridSize); // face id XY x:0->2 y:0->3
    
    // define the y limit for draw faces
    vec2 limY = vec2(0, uv.y);
    if (faceIdXY.x > 1.5 && faceIdXY.x < 2.5) // top & bottom faces
    	limY = vec2(0,faceSize.y*3.);
    else // all others
        limY = vec2(faceSize.y,faceSize.y*2.);

    // limit display inside the cube faces
    if ( uv.y >= limY.x && uv.y <= limY.y
#ifdef FACE_QUAD_SIZE
        && uv.x <= 1.0 
	#ifdef FACE_QUAD_SIZE_WITH_CENTERING
        && uv.x >= 0.0         
	#endif    
#endif
)
	{
        // get face id
        float faceId = 0.;
        if (faceIdXY.y<0.5) 	faceId = 4.;		 // top
        else if(faceIdXY.y>1.5) faceId = 5.;		 // bottom
        else 				    faceId = faceIdXY.x; // all others

        // face coord uvw
        vec3 p = getFaceUVW(uv,faceId,faceSize);
        
        // spheric to surface
        float theta = atan(p.y,p.x);
        float r = length(p);
        
        // correct spheric distortion for top and bottom faces
        // instead of just atan(p.z,r)
        float phi =  asin(p.z/r);
        
        return 0.5 + vec2(theta / _2pi, -phi / _pi);
    }
    return vec2(0); // outside faces => uv(0,0)
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 v = fragCoord / iResolution.xy;
    
#ifdef FACE_QUAD_SIZE
// it work if x > y else chnage axis
    	v.x *= 4.0/3.0;
    #ifdef FACE_QUAD_SIZE_WITH_CENTERING
    	v.x -= 0.5/3.0;
    #endif
#endif

    vec2 m = iMouse.xy / iResolution.xy;
    
    fragColor = texture(iChannel0, EquiRectToCubeMap(v));
    
    if (iMouse.z > 0. && m.x < 0.5)
    {
        // Equirectangular texture generated from the core CubeMap
        fragColor = texture(iChannel0, fragCoord / iResolution.xy);
    }
    else if (iMouse.z > 0. && m.x > 0.5)
    {
        float a = v.x * _2pi - _dpi + iTime;
        float b = v.y * _pi; 
        vec3 ct = vec3(-sin(b)*cos(a),cos(b),-sin(b)*sin(a)); // surf to spheric       
        vec2 po = 0.5 + vec2(atan(ct.z,ct.x)/_2pi,-asin(ct.y)/_pi);
        fragColor = texture(iChannel1, getCubeMap(po));
    }
}