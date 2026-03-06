import { Prisma } from "@prisma/client";

type ApiError = {
  code: string;
  message: string;
  status: number;
};

export const errorCodes = {
  common: {
    invalidData: "INVALID_DATA",
    notAuthenticated: "NOT_AUTHENTICATED",
    accessDenied: "ACCESS_DENIED",
  },
  auth: {
    emailAlreadyRegistered: "EMAIL_ALREADY_REGISTERED",
    invalidCredentials: "INVALID_CREDENTIALS",
    userNotFound: "USER_NOT_FOUND",
    invalidToken: "INVALID_TOKEN",
    registerUnexpected: "REGISTER_UNEXPECTED_ERROR",
    loginUnexpected: "LOGIN_UNEXPECTED_ERROR",
  },
  product: {
    notFound: "PRODUCT_NOT_FOUND",
    duplicateSlug: "PRODUCT_DUPLICATE_SLUG",
    fetchManyUnexpected: "PRODUCT_FETCH_UNEXPECTED_ERROR",
    fetchOneUnexpected: "PRODUCT_FETCH_ONE_UNEXPECTED_ERROR",
    createUnexpected: "PRODUCT_CREATE_UNEXPECTED_ERROR",
    updateUnexpected: "PRODUCT_UPDATE_UNEXPECTED_ERROR",
    deleteConflictWithOrders: "PRODUCT_DELETE_CONFLICT_WITH_ORDERS",
    deleteUnexpected: "PRODUCT_DELETE_UNEXPECTED_ERROR",
  },
  collection: {
    notFound: "COLLECTION_NOT_FOUND",
    duplicateSlug: "COLLECTION_DUPLICATE_SLUG",
    hasLinkedProducts: "COLLECTION_HAS_LINKED_PRODUCTS",
    fetchManyUnexpected: "COLLECTION_FETCH_UNEXPECTED_ERROR",
    fetchOneUnexpected: "COLLECTION_FETCH_ONE_UNEXPECTED_ERROR",
    createUnexpected: "COLLECTION_CREATE_UNEXPECTED_ERROR",
    updateUnexpected: "COLLECTION_UPDATE_UNEXPECTED_ERROR",
    deleteUnexpected: "COLLECTION_DELETE_UNEXPECTED_ERROR",
  },
  cart: {
    fetchUnexpected: "CART_FETCH_UNEXPECTED_ERROR",
    updateUnexpected: "CART_UPDATE_UNEXPECTED_ERROR",
    deleteUnexpected: "CART_DELETE_UNEXPECTED_ERROR",
  },
  order: {
    productNotFound: "ORDER_PRODUCT_NOT_FOUND",
    fetchUnexpected: "ORDER_FETCH_UNEXPECTED_ERROR",
    createUnexpected: "ORDER_CREATE_UNEXPECTED_ERROR",
  },
  storage: {
    invalidBucket: "STORAGE_INVALID_BUCKET",
    invalidFile: "STORAGE_INVALID_FILE",
    fileTooLarge: "STORAGE_FILE_TOO_LARGE",
    uploadUnexpected: "STORAGE_UPLOAD_UNEXPECTED_ERROR",
  },
} as const;

export const errorMessages = {
  common: {
    invalidData: "Dados inválidos",
    notAuthenticated: "Não autenticado",
  },
  auth: {
    emailAlreadyRegistered: "Email já cadastrado",
    invalidCredentials: "Credenciais inválidas",
    userNotFound: "Usuário não encontrado",
    invalidToken: "Token inválido",
    registerUnexpected: "Erro interno ao registrar usuário",
    loginUnexpected: "Erro interno ao autenticar usuário",
  },
  product: {
    notFound: "Produto não encontrado",
    duplicateSlug: "Já existe um produto com este slug",
    fetchManyUnexpected: "Erro ao buscar produtos",
    fetchOneUnexpected: "Erro ao buscar produto",
    createUnexpected: "Erro ao criar produto",
    updateUnexpected: "Erro ao atualizar produto",
    deleteConflictWithOrders:
      "Não é possível remover este produto porque ele já está vinculado a pedidos",
    deleteUnexpected: "Erro ao remover produto",
  },
  collection: {
    notFound: "Coleção não encontrada",
    duplicateSlug: "Já existe uma coleção com este slug",
    hasLinkedProducts: "Não é possível remover coleção com produtos vinculados",
    fetchManyUnexpected: "Erro ao buscar coleções",
    fetchOneUnexpected: "Erro ao buscar coleção",
    createUnexpected: "Erro ao criar coleção",
    updateUnexpected: "Erro ao atualizar coleção",
    deleteUnexpected: "Erro ao remover coleção",
  },
  cart: {
    fetchUnexpected: "Erro ao buscar carrinho",
    updateUnexpected: "Erro ao atualizar carrinho",
    deleteUnexpected: "Erro ao remover item do carrinho",
  },
  order: {
    productNotFound: "Um ou mais produtos não foram encontrados",
    fetchUnexpected: "Erro ao buscar pedidos",
    createUnexpected: "Erro ao criar pedido",
  },
  storage: {
    invalidBucket: "Bucket de upload inválido",
    invalidFile: "Arquivo inválido para upload",
    fileTooLarge: "Arquivo excede o limite permitido para o bucket selecionado",
    uploadUnexpected: "Erro ao enviar arquivo para o storage",
  },
} as const;

export const successMessages = {
  auth: {
    logout: "Logout realizado com sucesso",
  },
  product: {
    deleted: "Produto removido com sucesso",
  },
  collection: {
    deleted: "Coleção removida com sucesso",
  },
} as const;

export function mapProductDeleteError(errorValue: unknown): ApiError | null {
  if (!(errorValue instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (errorValue.code === "P2025") {
    return {
      code: errorCodes.product.notFound,
      message: errorMessages.product.notFound,
      status: 404,
    };
  }

  if (errorValue.code === "P2003") {
    return {
      code: errorCodes.product.deleteConflictWithOrders,
      message: errorMessages.product.deleteConflictWithOrders,
      status: 409,
    };
  }

  return null;
}
