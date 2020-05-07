
using System;

namespace XYZToDo.Models.ViewModels
{
    public class ReCaptchaUserResponse
    {
        public bool success { get; set; }
        public string challenge_ts { get; set; }
        public String hostname { get; set; }
        public float score { get; set; }

        //public object[] errorcodes { get; set; }
    }
}

