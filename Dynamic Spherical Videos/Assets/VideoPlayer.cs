using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class VideoPlayer : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        UnityEngine.Video.VideoPlayer player = GetComponent<UnityEngine.Video.VideoPlayer>();
        Debug.Log("Current frame: " + player.frame);
        
    }
}
