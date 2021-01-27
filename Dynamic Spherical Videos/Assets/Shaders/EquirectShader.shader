Shader "RobotKittens/Equirectangular"
{
	Properties
	{
		_Beta("Beta", Float) = 1 // 1 / Alpha, where Alpha is the margin factor (eg 1.1 to add 10% margin)

		_FaceTexPX("FaceTexPX", 2D) = "white" {}
		_FaceTexNX("FaceTexNX", 2D) = "white" {}
		_FaceTexPY("FaceTexPY", 2D) = "white" {}
		_FaceTexNY("FaceTexNY", 2D) = "white" {}
		_FaceTexPZ("FaceTexPZ", 2D) = "white" {}
		_FaceTexNZ("FaceTexNZ", 2D) = "white" {}
	}
		SubShader
	{
		Tags { "RenderType" = "Opaque" "PreviewType" = "Plane"}
		LOD 100

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			// make fog work
			#pragma multi_compile_fog
			#pragma shader_feature ORIENT_CUBE
			#pragma shader_feature SHOW_STITCH_LINES
			#pragma shader_feature TWO_CUBES
			#pragma shader_feature SMOOTH_STITCHING

			#include "UnityCG.cginc"

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				UNITY_FOG_COORDS(1)
				float4 vertex : SV_POSITION;
			};

			float _Beta;
			float _HorizontalFov;
			float _VerticalFov;

			sampler2D _FaceTexPX;
			sampler2D _FaceTexNX;
			sampler2D _FaceTexPY;
			sampler2D _FaceTexNY;
			sampler2D _FaceTexPZ;
			sampler2D _FaceTexNZ;

#ifdef ORIENT_CUBE
			float4x4 _OrientMatrix;
#endif

#ifdef TWO_CUBES
			sampler2D _FaceTexPX2;
			sampler2D _FaceTexNX2;
			sampler2D _FaceTexPY2;
			sampler2D _FaceTexNY2;
			sampler2D _FaceTexPZ2;
			sampler2D _FaceTexNZ2;
#  ifdef ORIENT_CUBE
			float4x4 _OrientMatrix2;
#  endif
#endif

			v2f vert(appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv;

				return o;
			}

			#include "Equirectangular.cginc"

			fixed4 frag(v2f i) : SV_Target
			{
				float2 px, px2;
				fixed4 c =
#ifdef SMOOTH_STITCHING
					equirectangularSmooth(
#else
					equirectangular(
#endif
						i, _FaceTexPX, _FaceTexNX, _FaceTexPY, _FaceTexNY, _FaceTexPZ, _FaceTexNZ,
#ifdef ORIENT_CUBE
						(float3x3)_OrientMatrix,
#endif
						_Beta, _HorizontalFov, _VerticalFov, px);

#ifdef TWO_CUBES
				fixed4 c2 =
#  ifdef SMOOTH_STITCHING
					equirectangularSmooth(
#  else
					equirectangular(
#  endif
						i, _FaceTexPX2, _FaceTexNX2, _FaceTexPY2, _FaceTexNY2, _FaceTexPZ2, _FaceTexNZ2,
#  ifdef ORIENT_CUBE
					(float3x3)_OrientMatrix2,
#  endif
					_Beta, _HorizontalFov, _VerticalFov, px2);
				float q = max(smoothstep(0.25, 0.45, abs(px.x - 0.5)), smoothstep(0.25, 0.45, abs(px.y - 0.5)));
				//float q2 = max(smoothstep(0.25, 0.45, abs(px2.x - 0.5)), smoothstep(0.25, 0.45, abs(px2.y - 0.5)));
				return lerp(c, c2, q);
#else
				return c;
#endif

			}

			ENDCG
		}
	}
}