import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CheckPass {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$foKwN3tinh0X2r92uZendOp05Vk5ub/MC6lEwDB2VYQY5c.zpsuHC";
        String[] passwords = {"c", "c123", "123456", "password", "admin", "12345678", "123456789"};
        for (String p : passwords) {
            if (encoder.matches(p, hash)) {
                System.out.println("Match found: " + p);
                return;
            }
        }
        System.out.println("No match found");
    }
}
