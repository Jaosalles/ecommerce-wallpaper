import { AuthFormData } from "@/components/auth-form/shared";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type AuthFieldsProps = {
  isLogin: boolean;
  register: UseFormRegister<AuthFormData>;
  errors: FieldErrors<AuthFormData>;
};

export function AuthFields({ isLogin, register, errors }: AuthFieldsProps) {
  return (
    <>
      {!isLogin ? (
        <>
          <label className="text-sm font-medium" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            {...register("name")}
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />
          {errors.name ? (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          ) : null}

          <label className="text-sm font-medium" htmlFor="phone">
            Telefone (opcional)
          </label>
          <input
            id="phone"
            {...register("phone")}
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />
          {errors.phone ? (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          ) : null}
        </>
      ) : null}

      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        {...register("email")}
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />
      {errors.email ? (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      ) : null}

      <label className="text-sm font-medium" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        type="password"
        {...register("password")}
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />
      {errors.password ? (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      ) : null}
    </>
  );
}
