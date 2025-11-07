package com.personregistry.backend;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PersonDto {

    @NotBlank
    @Pattern(regexp = "^[A-Z0-9]{16}$")
    private String taxCode;

    @NotBlank
    private String name;

    @NotBlank
    private String surname;

    @NotNull
    private AddressDto address;

    @Data
    public static class AddressDto {
        @NotBlank private String street;
        @NotBlank private String streetNo;
        @NotBlank private String city;
        @Pattern(regexp = "^[A-Z]{2}$") private String province;
        @NotBlank private String country;
    }
}
