Shader "Distort/4 Corner Pin" {
     Properties{
         _MainTex("Base (RGB)", 2D) = "white" {}
         _URx("URx", Range(-1.0,1.0)) = 0.0
         _URy("URy", Range(-1.0,1.0)) = 0.0
         _ULx("ULx", Range(-1.0,1.0)) = 0.0
         _ULy("ULy", Range(-1.0,1.0)) = 0.0
         _BLx("BLx", Range(-1.0,1.0)) = 0.0
         _BLy("BLy", Range(-1.0,1.0)) = 0.0
         _BRx("BRx", Range(-1.0,1.0)) = 0.0
         _BRy("BRy", Range(-1.0,1.0)) = 0.0
     }
 
         SubShader{
             Pass {
                 ZTest Always Cull Off ZWrite Off
                 Fog { Mode off }
 
                 CGPROGRAM
                 #pragma vertex vert
                 #pragma fragment frag
                 #pragma fragmentoption ARB_precision_hint_fastest 
                 #include "UnityCG.cginc"
 
                 uniform sampler2D _MainTex;
 
                 struct v2f {
                     float4 pos : SV_POSITION;
                     float2 uv : TEXCOORD0;
                 };
 
                 float _URx;
                 float _URy;
                 float _ULx;
                 float _ULy;
                 float _BLx;
                 float _BLy;
                 float _BRx;
                 float _BRy;
 
                 v2f vert(appdata_img v)
                 {
                     v2f o;
                     o.pos = UnityObjectToClipPos(v.vertex);
                     o.uv = v.texcoord;
                     o.pos.x += _BLx + ((_URx * o.uv.x*o.uv.y) + (_BRx * o.uv.x) + (_ULx * o.uv.y));
                     o.pos.y += _BLy + ((_URy * o.uv.x*o.uv.y) + (_ULy * o.uv.y) + (_BRy * o.uv.x));
                     return o;
                 }
 
                 float4 frag(v2f i) : SV_Target
                 {
                     float2 uv = i.uv;
                     return tex2D(_MainTex, uv);
                 }
                 ENDCG
             }
         }
             Fallback off
 }
 