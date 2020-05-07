using System;

namespace XYZToDo.Models.ViewModels
{
    public class RegisterModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Avatar { get; set; }
        public decimal? CellCountry { get; set; }
        public decimal? Cell { get; set; }
    }

}
