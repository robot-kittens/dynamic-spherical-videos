using System.Collections.Generic;
using UnityEngine;


public class TrackObjectWIthData : MonoBehaviour
{
    public UnityEngine.Video.VideoPlayer player;
    public TrackingData trackingData;

    // Start is called before the first frame update
    void Start()
    {
        //player = this.transform.parent.GetComponentInChildren<UnityEngine.Video.VideoPlayer>();
        trackingData = new TrackingData();

    }

    // Update is called once per frame
    void Update()
    {
        if(player)
        {
            Debug.Log("Got frame"+ player.frame);

            string frameNumber = (player.frame - 90).ToString();

            List<float[]> frame = trackingData.data[frameNumber];
            if (frame != null)
            {
                float[] cornerPinTopLeft = trackingData.data[player.frame.ToString()][0];
                float cornerPinTopLeftX = cornerPinTopLeft[0];
                float cornerPinTopLeftY = cornerPinTopLeft[1];

                RectTransform rect = GetComponent<RectTransform>();
                rect.anchoredPosition = new Vector2(cornerPinTopLeftX, -cornerPinTopLeftY);

            }


        }
    }
}


//public class TrackingData
//{
//    public Dictionary<string, List<Vector2>> data = new Dictionary<string, List<Vector2>>()
//    {
//        {
//            "henk", new List<Vector2>()
//            {
//                new Vector2(0,0),
//                new Vector2(0,5),
//            }
//        }
//    };
    

//    void bla()
//    {
//        //new ArrayList()
//        List < Vector2 > a = new List<Vector2>();
//        a.Add(new Vector2(0, 0));
//        data.Add("henk", a);
//    }
//}