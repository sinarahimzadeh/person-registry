
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pr_address")
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This links each address to a person’s tax code (foreign key)
    @Column(name = "person_tax_code", length = 16, nullable = false, unique = true)
    private String personTaxCode;

    @Column(nullable = false)
    private String street;

    @Column(name = "street_no", nullable = false)
    private String streetNo;

    @Column(nullable = false)
    private String city;

    @Column(length = 2, nullable = false)
    private String province;

    @Column(nullable = false)
    private String country;
}
