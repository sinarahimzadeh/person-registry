package com.personregistry.model.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddressDto {
    @NotBlank
    private String street;
    @NotBlank
    private String streetNo;
    @NotBlank
    private String city;
    @Pattern(regexp = "^[A-Z]{2}$")
    private String province;
    @NotBlank
    private String country;
}
