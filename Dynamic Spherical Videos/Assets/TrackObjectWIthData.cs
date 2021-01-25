using System.Collections.Generic;
using UnityEngine;


public class TrackObjectWIthData : MonoBehaviour
{
    public UnityEngine.Video.VideoPlayer player;
    // Start is called before the first frame update
    void Start()
    {
        player = this.transform.parent.GetComponentInChildren<UnityEngine.Video.VideoPlayer>();

    }

    // Update is called once per frame
    void Update()
    {
        if(player)
        {
            Debug.Log("Got frame"+ player.frame);
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