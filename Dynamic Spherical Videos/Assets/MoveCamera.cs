using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MoveCamera : MonoBehaviour
{
    float speed = 15.0f;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        //if (Input.GetKey(KeyCode.RightArrow))
        //{
        //    transform.Translate(new Vector3(speed * Time.deltaTime, 0, 0));
        //}
        //if (Input.GetKey(KeyCode.LeftArrow))
        //{
        //    transform.Translate(new Vector3(-speed * Time.deltaTime, 0, 0));
        //}
        //if (Input.GetKey(KeyCode.DownArrow))
        //{
        //    transform.Translate(new Vector3(0, -speed * Time.deltaTime, 0));
        //}
        //if (Input.GetKey(KeyCode.UpArrow))
        //{
        //    transform.Translate(new Vector3(0, speed * Time.deltaTime, 0));
        //}

        Vector3 rotation = transform.eulerAngles;

        rotation.y += Input.GetAxis("Horizontal") * speed * Time.deltaTime;
        rotation.x += Input.GetAxis("Vertical") * speed * Time.deltaTime;

        transform.eulerAngles = rotation;
    }
}
